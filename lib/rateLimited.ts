import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

export function rateLimit(config: RateLimitConfig = {}) {
  const tokenCache = new Map();

  return {
    check: async (limit: number, token: string) => {
      const tokenCount = tokenCache.get(token) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount);
      }
      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;

      return {
        success: !isRateLimited,
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
      };
    },
  };
}

export const rateLimited = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});
