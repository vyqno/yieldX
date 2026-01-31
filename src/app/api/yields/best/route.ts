/**
 * Public API: Get Best Yield
 * 
 * Endpoint: GET /api/yields/best
 * Query params:
 *   - category: "Stablecoin" | "ETH & LST" | "BTC" | "Governance" | "all" (default)
 *   - type: "supply" | "borrow" (default: supply)
 * 
 * Returns the asset with the highest APY.
 * Example: /api/yields/best?category=Stablecoin&type=supply
 */

import { NextResponse } from "next/server";
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
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const { success, headers: rateLimitHeaders } = await checkRateLimit(
      identifier,
      'free'
    );

    if (!success) {
      return createRateLimitResponse(rateLimitHeaders);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const type = searchParams.get("type") || "supply";
    
    const startTime = Date.now();
    
    // Fetch all yields
    let assets = await fetchAllAssetsYieldData();
    
    // Filter by category if specified
    if (category !== "all") {
      assets = assets.filter(
        (a) => a.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (assets.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No assets found",
          message: `No assets found for category '${category}'`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
    // Find best by type
    const best = assets.reduce((best, current) => {
      if (type === "borrow") {
        // For borrowing, lower is better
        return current.borrowAPY < best.borrowAPY && current.borrowingEnabled
          ? current
          : best;
      }
      // For supply, higher is better
      return current.supplyAPY > best.supplyAPY ? current : best;
    });
    
    const latencyMs = Date.now() - startTime;
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      protocol: "Aave V3",
      chain: "ethereum",
      chainId: 1,
      latencyMs,
      query: {
        category: category === "all" ? "All" : category,
        type,
      },
      bestAsset: {
        symbol: best.symbol,
        address: best.address,
        category: best.category,
        supplyAPY: parseFloat(best.supplyAPY.toFixed(4)),
        borrowAPY: parseFloat(best.borrowAPY.toFixed(4)),
        utilizationRate: parseFloat(best.utilizationRate.toFixed(2)),
        isActive: best.isActive,
        borrowingEnabled: best.borrowingEnabled,
      },
      recommendation:
        type === "supply"
          ? `Deposit ${best.symbol} to earn ${best.supplyAPY.toFixed(2)}% APY`
          : `Borrow ${best.symbol} at ${best.borrowAPY.toFixed(2)}% APY`,
    };
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Data-Source": "direct-rpc",
        "X-Latency-Ms": latencyMs.toString(),
        ...rateLimitHeaders,
      },
    });
  } catch (error) {
    console.error("[API /yields/best] Error:", error);
    
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
