import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../../ormconfig';
import { AuditLog, AuditEventType, AuditSeverity } from '../models/auditLog';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
}

interface RateLimitRule {
  endpoint: string;
  config: RateLimitConfig;
  requiresAuth?: boolean;
  requiresVerified?: boolean;
}

// Rate limiting rules for different endpoints
const RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    endpoint: '/api/stories',
    method: 'POST',
    config: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 posts per 15 minutes
      requiresAuth: true,
      requiresVerified: true
    }
  },
  {
    endpoint: '/api/stories/:id/flag',
    method: 'POST',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10, // 10 flags per hour
      requiresAuth: true
    }
  },
  {
    endpoint: '/api/companies/claim',
    method: 'POST',
    config: {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequests: 3, // 3 claims per day
      requiresAuth: true,
      requiresVerified: true
    }
  },
  {
    endpoint: '/api/eli5-suggestions',
    method: 'POST',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 20, // 20 suggestions per hour
      requiresAuth: true
    }
  },
  {
    endpoint: '/api/auth/register',
    method: 'POST',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5, // 5 registrations per hour per IP
      keyGenerator: (req) => `register:${req.ip}`
    }
  },
  {
    endpoint: '/api/auth/login',
    method: 'POST',
    config: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10, // 10 login attempts per 15 minutes
      keyGenerator: (req) => `login:${req.ip}`
    }
  },
  {
    endpoint: '/api/briefs/daily',
    method: 'GET',
    config: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10, // 10 brief requests per hour
      requiresAuth: true
    }
  }
];

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class RateLimiter {
  private auditLogRepository = AppDataSource.getRepository(AuditLog);

  /**
   * Middleware to apply rate limiting based on configured rules
   */
  async rateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = this.findMatchingRule(req.path, req.method);
      
      if (!rule) {
        // No rate limiting for this endpoint
        return next();
      }

      // Check authentication requirements
      if (rule.requiresAuth && !req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required for this endpoint'
        });
        return;
      }

      // Check verification requirements
      if (rule.requiresVerified && (!req.user || !req.user.isVerified)) {
        res.status(403).json({
          success: false,
          message: 'Verified account required for this endpoint'
        });
        return;
      }

      // Generate rate limit key
      const key = rule.config.keyGenerator 
        ? rule.config.keyGenerator(req)
        : this.generateDefaultKey(req, rule.endpoint);

      // Check rate limit
      const isAllowed = await this.checkRateLimit(key, rule.config);
      
      if (!isAllowed) {
        // Rate limit exceeded
        await this.handleRateLimitExceeded(req, res, rule);
        return;
      }

      // Rate limit passed, continue
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request to proceed
      next();
    }
  }

  /**
   * Check if request is within rate limit
   */
  private async checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get current rate limit data
    const rateLimitData = rateLimitStore.get(key);
    
    if (!rateLimitData || rateLimitData.resetTime <= now) {
      // No existing data or window expired, create new window
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }

    // Check if within limit
    if (rateLimitData.count < config.maxRequests) {
      // Increment count
      rateLimitData.count++;
      return true;
    }

    return false;
  }

  /**
   * Handle rate limit exceeded
   */
  private async handleRateLimitExceeded(req: Request, res: Response, rule: RateLimitRule): Promise<void> {
    const key = rule.config.keyGenerator 
      ? rule.config.keyGenerator(req)
      : this.generateDefaultKey(req, rule.endpoint);

    const rateLimitData = rateLimitStore.get(key);
    const resetTime = rateLimitData?.resetTime || Date.now() + rule.config.windowMs;
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    // Log rate limit exceeded
    await this.logAuditEvent({
      eventType: AuditEventType.RATE_LIMIT_EXCEEDED,
      severity: AuditSeverity.WARNING,
      userId: req.user?.id,
      description: `Rate limit exceeded for ${rule.endpoint}`,
      metadata: {
        endpoint: rule.endpoint,
        method: req.method,
        rateLimitKey: key,
        maxRequests: rule.config.maxRequests,
        windowMs: rule.config.windowMs,
        retryAfter,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      },
      req
    });

    // Call custom handler if provided
    if (rule.config.onLimitReached) {
      rule.config.onLimitReached(req, res);
      return;
    }

    // Default response
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded',
      data: {
        retryAfter,
        limit: rule.config.maxRequests,
        window: Math.ceil(rule.config.windowMs / 1000 / 60), // window in minutes
        endpoint: rule.endpoint
      }
    });
  }

  /**
   * Find matching rate limit rule for request
   */
  private findMatchingRule(path: string, method: string): RateLimitRule | null {
    return RATE_LIMIT_RULES.find(rule => {
      // Check method match
      if (rule.method && rule.method !== method) {
        return false;
      }

      // Check path match (supports wildcards)
      if (rule.endpoint.includes(':')) {
        // Convert route pattern to regex
        const pattern = rule.endpoint
          .replace(/:[^/]+/g, '[^/]+')
          .replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(path);
      } else {
        return path === rule.endpoint;
      }
    }) || null;
  }

  /**
   * Generate default rate limit key
   */
  private generateDefaultKey(req: Request, endpoint: string): string {
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || 'unknown';
    return `${endpoint}:${userId}:${ip}`;
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(eventData: {
    eventType: AuditEventType;
    severity: AuditSeverity;
    userId?: string;
    description: string;
    metadata?: any;
    req?: Request;
  }): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        eventType: eventData.eventType,
        severity: eventData.severity,
        userId: eventData.userId || null,
        description: eventData.description,
        metadata: eventData.metadata,
        ipAddress: eventData.req?.ip,
        userAgent: eventData.req?.get('User-Agent'),
        endpoint: eventData.req?.path,
        httpMethod: eventData.req?.method
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * Get rate limit status for a user
   */
  async getRateLimitStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const status = {};
      
      // Check status for each rule
      for (const rule of RATE_LIMIT_RULES) {
        if (!rule.requiresAuth) continue;

        const key = rule.config.keyGenerator 
          ? rule.config.keyGenerator(req)
          : this.generateDefaultKey(req, rule.endpoint);

        const rateLimitData = rateLimitStore.get(key);
        
        if (rateLimitData) {
          status[rule.endpoint] = {
            current: rateLimitData.count,
            limit: rule.config.maxRequests,
            resetTime: rateLimitData.resetTime,
            remaining: Math.max(0, rule.config.maxRequests - rateLimitData.count)
          };
        } else {
          status[rule.endpoint] = {
            current: 0,
            limit: rule.config.maxRequests,
            resetTime: null,
            remaining: rule.config.maxRequests
          };
        }
      }

      res.status(200).json({
        success: true,
        message: 'Rate limit status retrieved successfully',
        data: status
      });
    } catch (error) {
      console.error('Get rate limit status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving rate limit status'
      });
    }
  }

  /**
   * Clear rate limit for a user (admin only)
   */
  async clearRateLimit(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin
      const user = await AppDataSource.getRepository('User').findOne({ where: { id: userId } });
      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
        return;
      }

      const { endpoint, targetUserId } = req.body;

      if (!endpoint || !targetUserId) {
        res.status(400).json({
          success: false,
          message: 'Endpoint and target user ID are required'
        });
        return;
      }

      // Clear rate limit for specific endpoint and user
      const keysToDelete = [];
      for (const [key, value] of rateLimitStore.entries()) {
        if (key.includes(endpoint) && key.includes(targetUserId)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => rateLimitStore.delete(key));

      // Log the admin action
      await this.logAuditEvent({
        eventType: AuditEventType.MODERATION_ACTION,
        severity: AuditSeverity.INFO,
        userId,
        description: `Admin cleared rate limit for user ${targetUserId} on endpoint ${endpoint}`,
        metadata: {
          targetUserId,
          endpoint,
          clearedKeys: keysToDelete
        },
        req
      });

      res.status(200).json({
        success: true,
        message: 'Rate limit cleared successfully',
        data: {
          clearedKeys: keysToDelete.length,
          endpoint,
          targetUserId
        }
      });
    } catch (error) {
      console.error('Clear rate limit error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while clearing rate limit'
      });
    }
  }
}

export const rateLimiter = new RateLimiter();
