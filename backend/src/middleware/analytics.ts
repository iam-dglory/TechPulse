import { Request, Response, NextFunction } from 'express';
import { eventTracker, EventType } from '../services/analytics/eventTracker';
import { AuthenticatedRequest } from './auth';

export interface AnalyticsContext {
  startTime: number;
  userAgent?: string;
  ip?: string;
  referrer?: string;
}

export function analyticsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const context: AnalyticsContext = {
    startTime,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    referrer: req.headers.referer,
  };

  // Store context in request for later use
  (req as any).analyticsContext = context;

  // Track API usage
  const originalSend = res.send;
  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Track API call
    eventTracker.track({
      event: EventType.API_ERROR, // Will be overridden by specific events
      timestamp: new Date(),
      properties: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        userAgent: context.userAgent,
        ip: context.ip,
      },
      context: {
        userAgent: context.userAgent,
        ip: context.ip,
        referrer: context.referrer,
      },
    }, (req as AuthenticatedRequest).user).catch(console.error);

    return originalSend.call(this, body);
  };

  next();
}

export function trackStoryView(storyId: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { Story } = await import('../models/story');
      const story = await Story.findOne({ where: { id: storyId } });
      
      if (story) {
        await eventTracker.trackStoryViewed(story, req.user, {
          viewDuration: Date.now() - (req as any).analyticsContext?.startTime,
        });
      }
    } catch (error) {
      console.error('Failed to track story view:', error);
    }
    next();
  };
}

export function trackCompanyView(companyId: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { Company } = await import('../models/company');
      const company = await Company.findOne({ where: { id: companyId } });
      
      if (company) {
        await eventTracker.trackCompanyViewed(company, req.user);
      }
    } catch (error) {
      console.error('Failed to track company view:', error);
    }
    next();
  };
}
