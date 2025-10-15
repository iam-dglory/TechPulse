import { LRUCache } from 'lru-cache';

/**
 * LRU Cache configuration for the mobile app
 */
const cacheConfig = {
  // Maximum number of items to store
  max: 100,
  // TTL (time to live) in milliseconds - 10 minutes
  ttl: 10 * 60 * 1000,
  // Allow stale items to be returned while updating in background
  allowStale: true,
  // Update stale items in background
  updateAgeOnGet: true,
  // Update access time when retrieving items
  updateAgeOnHas: true,
};

// Create separate caches for different data types
export const apiCache = new LRUCache<string, any>({
  ...cacheConfig,
  // API responses cache - 5 minutes
  ttl: 5 * 60 * 1000,
});

export const userCache = new LRUCache<string, any>({
  ...cacheConfig,
  // User data cache - 15 minutes
  ttl: 15 * 60 * 1000,
});

export const companyCache = new LRUCache<string, any>({
  ...cacheConfig,
  // Company data cache - 30 minutes
  ttl: 30 * 60 * 1000,
});

export const storyCache = new LRUCache<string, any>({
  ...cacheConfig,
  // Story data cache - 10 minutes
  ttl: 10 * 60 * 1000,
});

/**
 * Cache utility functions
 */
export class CacheManager {
  /**
   * Get data from cache
   */
  static get<T>(cache: LRUCache<string, T>, key: string): T | undefined {
    return cache.get(key);
  }

  /**
   * Set data in cache
   */
  static set<T>(cache: LRUCache<string, T>, key: string, value: T, ttl?: number): void {
    cache.set(key, value, { ttl });
  }

  /**
   * Delete data from cache
   */
  static delete(cache: LRUCache<string, any>, key: string): boolean {
    return cache.delete(key);
  }

  /**
   * Clear all data from cache
   */
  static clear(cache: LRUCache<string, any>): void {
    cache.clear();
  }

  /**
   * Check if key exists in cache
   */
  static has(cache: LRUCache<string, any>, key: string): boolean {
    return cache.has(key);
  }

  /**
   * Get cache statistics
   */
  static getStats(cache: LRUCache<string, any>) {
    return {
      size: cache.size,
      max: cache.max,
      calculatedSize: cache.calculatedSize,
      disposed: cache.disposed,
    };
  }

  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    apiCache.clear();
    userCache.clear();
    companyCache.clear();
    storyCache.clear();
  }

  /**
   * Generate cache key for API endpoints
   */
  static generateApiKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `api:${endpoint}:${paramString}`;
  }

  /**
   * Generate cache key for user data
   */
  static generateUserKey(userId: string, dataType: string): string {
    return `user:${userId}:${dataType}`;
  }

  /**
   * Generate cache key for company data
   */
  static generateCompanyKey(companyId: string, dataType?: string): string {
    return dataType ? `company:${companyId}:${dataType}` : `company:${companyId}`;
  }

  /**
   * Generate cache key for story data
   */
  static generateStoryKey(storyId: string, dataType?: string): string {
    return dataType ? `story:${storyId}:${dataType}` : `story:${storyId}`;
  }
}

/**
 * Cache warming utility for preloading frequently accessed data
 */
export class CacheWarmer {
  /**
   * Warm up the cache with initial data
   */
  static async warmUpCache(apiService: any): Promise<void> {
    try {
      console.log('🔥 Warming up cache...');
      
      // Preload popular stories
      const stories = await apiService.getPosts();
      if (stories?.posts) {
        stories.posts.slice(0, 10).forEach((story: any) => {
          const key = CacheManager.generateStoryKey(story.id);
          CacheManager.set(storyCache, key, story);
        });
      }

      // Preload company data if available
      // Note: This would require company API endpoints
      
      console.log('✅ Cache warmed up successfully');
    } catch (error) {
      console.warn('⚠️ Cache warming failed:', error);
    }
  }
}

export default CacheManager;
