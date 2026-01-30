/**
 * Redis Cache (Upstash)
 * 
 * Stores real-time yield data. Updated on events, served to API/WebSocket.
 * 
 * Keys:
 *   - yields:latest → All assets with APY data
 *   - yields:timestamp → Last update timestamp
 */

import { Redis } from "@upstash/redis";
import type { AssetYieldData } from "./dynamic-fetcher";
import { ENV } from "./env";

// Initialize Redis client
export const redis = new Redis({
  url: ENV.REDIS_REST_URL,
  token: ENV.REDIS_REST_TOKEN,
});

// Cache keys
const CACHE_KEY = "yields:latest";
const TIMESTAMP_KEY = "yields:timestamp";

// TTL: 1 hour (fallback if events stop)
const TTL_SECONDS = 3600;

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return Boolean(ENV.REDIS_REST_URL && ENV.REDIS_REST_TOKEN);
}

/**
 * Store yield data in cache
 */
export async function setYieldsCache(data: AssetYieldData[]): Promise<void> {
  try {
    const payload = {
      assets: data,
      timestamp: new Date().toISOString(),
      assetCount: data.length,
    };
    
    await Promise.all([
      redis.set(CACHE_KEY, JSON.stringify(payload), { ex: TTL_SECONDS }),
      redis.set(TIMESTAMP_KEY, new Date().toISOString(), { ex: TTL_SECONDS }),
    ]);
    
    console.log(`[Redis] Cached ${data.length} assets`);
  } catch (error) {
    console.error("[Redis] Cache write failed:", error);
  }
}

/**
 * Get yield data from cache
 */
export async function getYieldsCache(): Promise<{
  assets: AssetYieldData[];
  timestamp: string;
  assetCount: number;
} | null> {
  try {
    const data = await redis.get<string>(CACHE_KEY);
    
    if (!data) {
      console.log("[Redis] Cache miss");
      return null;
    }
    
    // Handle both string and object responses
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    console.log(`[Redis] Cache hit: ${parsed.assetCount} assets`);
    return parsed;
  } catch (error) {
    console.error("[Redis] Cache read failed:", error);
    return null;
  }
}

/**
 * Get cache timestamp
 */
export async function getCacheTimestamp(): Promise<string | null> {
  try {
    return await redis.get<string>(TIMESTAMP_KEY);
  } catch {
    return null;
  }
}

/**
 * Clear cache (for debugging)
 */
export async function clearCache(): Promise<void> {
  await Promise.all([
    redis.del(CACHE_KEY),
    redis.del(TIMESTAMP_KEY),
  ]);
  
  console.log("[Redis] Cache cleared");
}
