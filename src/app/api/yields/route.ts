/**
 * Public API: Get All Aave V3 Yields
 * 
 * Endpoint: GET /api/yields
 * 
 * Returns real-time APY data for all Aave V3 Ethereum assets.
 * 
 * Data source priority:
 * 1. Redis cache (instant, ~5ms)
 * 2. Fallback to RPC (if cache empty, ~5-10s)
 * 
 * Response format:
 * {
 *   success: true,
 *   timestamp: "2026-01-31T12:00:00Z",
 *   dataSource: "cache" | "rpc",
 *   protocol: "Aave V3",
 *   chain: "ethereum",
 *   assetCount: 30,
 *   assets: [...]
 * }
 */

import { NextResponse } from "next/server";
import { getYieldsCache, isRedisConfigured } from "@/lib/redis";
import { fetchAllAssetsYieldData } from "@/lib/dynamic-fetcher";
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // Check rate limit
    const identifier = getClientIdentifier(request);
    const { success, headers: rateLimitHeaders } = await checkRateLimit(
      identifier,
      'free'
    );

    if (!success) {
      return createRateLimitResponse(rateLimitHeaders);
    }

    const startTime = Date.now();
    let dataSource: "cache" | "rpc" = "rpc";
    let assets;
    let cacheTimestamp: string | undefined;
    
    // Try to read from Redis cache first
    if (isRedisConfigured()) {
      const cached = await getYieldsCache();
      
      if (cached && cached.assets && cached.assets.length > 0) {
        assets = cached.assets;
        cacheTimestamp = cached.timestamp;
        dataSource = "cache";
        console.log(`[API /yields] Served from cache: ${assets.length} assets`);
      }
    }
    
    // Fallback to RPC if cache miss
    if (!assets) {
      console.log("[API /yields] Cache miss, fetching from RPC...");
      assets = await fetchAllAssetsYieldData();
      
      // Populate cache for next time
      if (assets.length > 0 && isRedisConfigured()) {
        const { setYieldsCache } = await import("@/lib/redis");
        setYieldsCache(assets).catch(err => console.error("Background cache write failed", err));
      }

      dataSource = "rpc";
    }
    
    const latencyMs = Date.now() - startTime;
    
    // Format response
    const response = {
      success: true,
      timestamp: cacheTimestamp || new Date().toISOString(),
      dataSource,
      protocol: "Aave V3",
      chain: "ethereum",
      chainId: 1,
      poolAddress: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
      assetCount: assets.length,
      latencyMs,
      assets: assets.map((asset) => ({
        symbol: asset.symbol,
        address: asset.address,
        category: asset.category,
        supplyAPY: parseFloat(asset.supplyAPY.toFixed(4)),
        borrowAPY: parseFloat(asset.borrowAPY.toFixed(4)),
        utilizationRate: parseFloat(asset.utilizationRate.toFixed(2)),
        totalSupplyRaw: asset.totalSupply,
        totalBorrowRaw: asset.totalBorrow,
        isActive: asset.isActive,
        borrowingEnabled: asset.borrowingEnabled,
        lastOnChainUpdate: asset.lastUpdated,
      })),
    };
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "X-Data-Source": dataSource,
        "X-Latency-Ms": latencyMs.toString(),
        ...rateLimitHeaders,
      },
    });
  } catch (error) {
    console.error("[API /yields] Error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch yield data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
