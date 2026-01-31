/**
 * Public API: Get Single Asset Yield
 * 
 * Endpoint: GET /api/yields/[symbol]
 * 
 * Returns real-time APY data for a specific asset.
 * Example: /api/yields/USDC
 */

import { NextResponse } from "next/server";
import { fetchAllReserveTokens, fetchAssetYieldData } from "@/lib/dynamic-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();
    
    const startTime = Date.now();
    
    // Get all tokens to find the one we need
    const tokens = await fetchAllReserveTokens();
    const token = tokens.find((t) => t.symbol.toUpperCase() === upperSymbol);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found",
          message: `Asset '${symbol}' is not available on Aave V3 Ethereum`,
          availableAssets: tokens.map((t) => t.symbol),
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
    // Fetch yield data for this specific asset
    const asset = await fetchAssetYieldData(token);
    
    const latencyMs = Date.now() - startTime;
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      protocol: "Aave V3",
      chain: "ethereum",
      chainId: 1,
      latencyMs,
      asset: {
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
        lastOnChainUpdateISO: new Date(asset.lastUpdated * 1000).toISOString(),
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Data-Source": "direct-rpc",
        "X-Latency-Ms": latencyMs.toString(),
      },
    });
  } catch (error) {
    console.error("[API /yields/[symbol]] Error:", error);
    
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
