/**
 * Next.js Middleware
 *
 * Implements:
 * 1. Rate limiting for API routes
 * 2. URL redirects for old domain names
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// RATE LIMITING
// ============================================

/**
 * Rate limit configuration
 */
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per window

/**
 * In-memory store for rate limiting
 * NOTE: Use Redis in production for distributed systems
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

/**
 * Check if request should be rate limited
 * @param identifier - IP address or 'anonymous'
 * @returns true if rate limit exceeded, false otherwise
 */
function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First request from this identifier
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  if (now > entry.resetTime) {
    // Window expired, reset
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return false;
  }

  // Within window, increment count
  entry.count++;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  return false;
}

/**
 * Get rate limit headers for response
 */
function getRateLimitHeaders(identifier: string): Record<string, string> {
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    return {
      'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString(),
    };
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);

  return {
    'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
  };
}

// ============================================
// MIDDLEWARE FUNCTION
// ============================================

/**
 * Next.js Middleware
 *
 * Handles:
 * - Rate limiting for /api/* routes
 * - URL redirects for old domain names
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // 1. RATE LIMITING FOR API ROUTES
  // ============================================

  if (pathname.startsWith('/api/')) {
    // Get identifier from IP address or use 'anonymous'
    const ip = request.ip ||
               request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'anonymous';

    const identifier = ip.trim();

    // Check rate limit
    if (isRateLimited(identifier)) {
      const headers = getRateLimitHeaders(identifier);

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
            timestamp: new Date().toISOString(),
          },
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': '60',
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    const headers = getRateLimitHeaders(identifier);

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // ============================================
  // 2. URL REDIRECTS FOR OLD DOMAIN NAMES
  // ============================================

  // Check if pathname contains old domain references
  const lowerPathname = pathname.toLowerCase();

  if (lowerPathname.includes('techpulse') || lowerPathname.includes('techpulze')) {
    // Replace with correct domain name
    const newPathname = pathname
      .replace(/techpulse/gi, 'texhpulze')
      .replace(/techpulze/gi, 'texhpulze');

    const url = request.nextUrl.clone();
    url.pathname = newPathname;

    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // Continue to next middleware or route handler
  return NextResponse.next();
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
