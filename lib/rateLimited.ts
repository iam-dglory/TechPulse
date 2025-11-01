import { NextResponse } from 'next/server'

// Simple rate limiting utility
// For production, consider using Upstash Rate Limit or similar service

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  limit: number // Max requests per interval
}

const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimited(config: RateLimitConfig = { interval: 60000, limit: 60 }) {
  return function (handler: Function) {
    return async function (request: Request, context?: any) {
      // Get client identifier (IP address or other identifier)
      const identifier = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        'anonymous'

      const now = Date.now()
      const record = requestCounts.get(identifier)

      if (record) {
        if (now < record.resetTime) {
          if (record.count >= config.limit) {
            return NextResponse.json(
              { error: 'Too many requests. Please try again later.' },
              {
                status: 429,
                headers: {
                  'X-RateLimit-Limit': config.limit.toString(),
                  'X-RateLimit-Remaining': '0',
                  'X-RateLimit-Reset': record.resetTime.toString(),
                }
              }
            )
          }
          record.count++
        } else {
          // Reset the counter
          record.count = 1
          record.resetTime = now + config.interval
        }
      } else {
        // First request from this identifier
        requestCounts.set(identifier, {
          count: 1,
          resetTime: now + config.interval,
        })
      }

      // Clean up old entries periodically
      if (Math.random() < 0.01) {
        for (const [key, value] of requestCounts.entries()) {
          if (now > value.resetTime) {
            requestCounts.delete(key)
          }
        }
      }

      // Call the actual handler
      return handler(request, context)
    }
  }
}
