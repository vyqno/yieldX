/**
 * Yield Data Service
 *
 * Helper functions to fetch yield data for AI agent
 */

import { fetchAllAssetsYieldData, type AssetYieldData } from './dynamic-fetcher';
import { getYieldsCache, isRedisConfigured } from './redis';

// Re-export the AssetYieldData type from dynamic-fetcher for consistency
export type { AssetYieldData };

/**
 * Get yield data for all assets
 * Tries cache first, falls back to RPC
 */
export async function getYieldData(): Promise<AssetYieldData[]> {
  try {
    // Try Redis cache first
    if (isRedisConfigured()) {
      const cached = await getYieldsCache();
      if (cached && cached.assets && cached.assets.length > 0) {
        return cached.assets;
      }
    }

    // Fallback to RPC
    const assets = await fetchAllAssetsYieldData();
    return assets;
  } catch (error) {
    console.error('Failed to fetch yield data:', error);
    return [];
  }
}

/**
 * Get yield data for a specific asset
 */
export async function getAssetYieldData(symbol: string): Promise<AssetYieldData | null> {
  const allAssets = await getYieldData();
  return allAssets.find(a => a.symbol.toUpperCase() === symbol.toUpperCase()) || null;
}

/**
 * Get top yielding assets
 */
export async function getTopYieldingAssets(limit: number = 5): Promise<AssetYieldData[]> {
  const allAssets = await getYieldData();
  return allAssets
    .filter(a => a.isActive)
    .sort((a, b) => b.supplyAPY - a.supplyAPY)
    .slice(0, limit);
}
