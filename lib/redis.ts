/**
 * Redis client setup for caching and rate limiting
 * Uses Upstash Redis for serverless compatibility
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiters for different operations
export const rateLimits = {
  // Read operations: 10 requests per minute
  read: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: '@ratelimit/read',
  }),

  // Write operations: 5 requests per minute
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: '@ratelimit/write',
  }),

  // AI operations: 3 requests per minute
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: '@ratelimit/ai',
  }),
};

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Delete cache entry
   */
  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Note: This requires SCAN which might not be available in all Redis setups
      // For Upstash, consider using a different strategy
      console.log(`Cache invalidation pattern: ${pattern}`);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  },
};

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
  identifier: string,
  type: 'read' | 'write' | 'ai' = 'read'
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  try {
    const limiter = rateLimits[type];
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if rate limit check fails
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}
