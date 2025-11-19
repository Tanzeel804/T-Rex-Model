import NodeCache from "node-cache";

class CacheManager {
  constructor() {
    this.cache = new NodeCache({
      stdTTL: 600, // Default TTL: 10 minutes
      checkperiod: 120, // Check for expired keys every 2 minutes
    });
  }

  set(key, value, ttl = null) {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  get(key) {
    return this.cache.get(key);
  }

  del(key) {
    return this.cache.del(key);
  }

  flush() {
    return this.cache.flushAll();
  }

  stats() {
    return this.cache.getStats();
  }
}

export const cache = new CacheManager();
