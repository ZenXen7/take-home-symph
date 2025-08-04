import { UrlCacheEntry } from '../models/url';

export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export const urlCache = new Map<string, UrlCacheEntry>();

export const initializeCache = () => {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of urlCache.entries()) {
      if (now - value.lastAccessed > CACHE_TTL) {
        urlCache.delete(key);
      }
    }
  }, CACHE_TTL);
};