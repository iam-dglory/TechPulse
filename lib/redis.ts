import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache utilities
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttl })
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    // Note: Upstash doesn't support SCAN, so we track keys manually
    await redis.del(pattern)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}
