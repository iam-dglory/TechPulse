// lib/rateLimiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Define rate limit configurations
const rateLimitConfigs = {
  default: Ratelimit.slidingWindow(30, '1m'), // 30 requests per minute
  auth: Ratelimit.slidingWindow(10, '1m'),    // 10 auth requests per minute
  api: Ratelimit.slidingWindow(60, '1m'),     // 60 API requests per minute
  admin: Ratelimit.slidingWindow(100, '1m'),  // 100 admin requests per minute
};

// Create rate limiters
export const limiters = {
  default: new Ratelimit({
    redis,
    limiter: rateLimitConfigs.default,
    analytics: true,
  }),
  auth: new Ratelimit({
    redis,
    limiter: rateLimitConfigs.auth,
    analytics: true,
  }),
  api: new Ratelimit({
    redis,
    limiter: rateLimitConfigs.api,
    analytics: true,
  }),
  admin: new Ratelimit({
    redis,
    limiter: rateLimitConfigs.admin,
    analytics: true,
  }),
};

/**
 * Apply rate limiting to a Next.js API route
 * @param request - The incoming request
 * @param limiterType - The type of limiter to use (default, auth, api, admin)
 * @returns Response if rate limit exceeded, null otherwise
 */
export async function rateLimitRequest(
  request: NextRequest,
  limiterType: keyof typeof limiters = 'default'
): Promise<NextResponse | null> {
  try {
    // Get IP address from request
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
    
    // Apply rate limiting
    const limiter = limiters[limiterType];
    const { success, limit, reset, remaining } = await limiter.limit(`${limiterType}_${ip}`);
    
    // Set rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', limit.toString());
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', reset.toString());
    
    // If rate limit exceeded, return 429 response
    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        { 
          status: 429, 
          headers 
        }
      );
    }
    
    // Return null to continue processing the request
    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return null; // Continue processing the request if rate limiting fails
  }
}
