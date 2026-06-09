import NodeCache from 'node-cache';

// Initialize cache with default TTL
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL_SECONDS || '3600'), // 1 hour default
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone objects for better performance
});

/**
 * Get value from cache
 */
export const getCache = <T>(key: string): T | undefined => {
  return cache.get<T>(key);
};

/**
 * Set value in cache
 */
export const setCache = (key: string, value: any, ttl?: number): boolean => {
  if (ttl) {
    return cache.set(key, value, ttl);
  }
  return cache.set(key, value);
};

/**
 * Delete value from cache
 */
export const deleteCache = (key: string): number => {
  return cache.del(key);
};

/**
 * Clear all cache
 */
export const clearCache = (): void => {
  cache.flushAll();
};

/**
 * Get cache stats
 */
export const getCacheStats = () => {
  return cache.getStats();
};

/**
 * Cache middleware decorator
 */
export const withCache = (ttl?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Create cache key from method name and arguments
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      // Check cache
      const cachedValue = getCache(cacheKey);
      if (cachedValue !== undefined) {
        return cachedValue;
      }

      // Execute method
      const result = originalMethod.apply(this, args);

      // Cache result
      setCache(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
};

export default cache;
