// lib/rateLimiter.ts
import { Ratelimit } from '@upstash/ratelimit'; // npm install @upstash/ratelimit
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 30 requests per minute per IP (adjust for production)
export const lim = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
});

export async function rateLimit(key: string) {
  const res = await lim.limit(key);
  return res;
}
