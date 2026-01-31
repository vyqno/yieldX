/**
 * Compare Yields Endpoint
 *
 * GET /api/yields/compare?symbols=USDC,USDT,DAI
 *
 * Compare yields across specific assets side-by-side.
 * Returns detailed comparison with delta calculations.
 *
 * Query params:
 * - symbols: Comma-separated list of symbols (required)
 */

import { NextResponse } from 'next/server';
import { getYieldsCache } from '@/lib/redis';
import { fetchAllAssetsYieldData } from '@/lib/dynamic-fetcher';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter',
          message: 'Please provide symbols parameter (e.g., ?symbols=USDC,USDT)',
        },
        { status: 400 }
      );
    }

    const requestedSymbols = symbolsParam
      .split(',')
      .map((s) => s.trim().toUpperCase());

    // Get yield data
    const cached = await getYieldsCache();
    const allAssets = cached?.assets || (await fetchAllAssetsYieldData());

    // Filter requested assets
    const comparison = allAssets
      .filter((asset) => requestedSymbols.includes(asset.symbol))
      .map((asset) => ({
        symbol: asset.symbol,
        address: asset.address,
        category: asset.category,
        supplyAPY: parseFloat(asset.supplyAPY.toFixed(4)),
        borrowAPY: parseFloat(asset.borrowAPY.toFixed(4)),
        utilizationRate: parseFloat(asset.utilizationRate.toFixed(2)),
        totalSupplyRaw: asset.totalSupply,
        totalBorrowRaw: asset.totalBorrow,
      }));

    if (comparison.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No assets found',
          message: `None of the requested symbols were found: ${requestedSymbols.join(', ')}`,
        },
        { status: 404 }
      );
    }

    // Calculate deltas from highest yield
    const maxSupplyAPY = Math.max(...comparison.map((a) => a.supplyAPY));
    const maxBorrowAPY = Math.max(...comparison.map((a) => a.borrowAPY));

    const comparisonWithDeltas = comparison.map((asset) => ({
      ...asset,
      supplyAPYDelta: parseFloat(
        (asset.supplyAPY - maxSupplyAPY).toFixed(4)
      ),
      borrowAPYDelta: parseFloat(
        (asset.borrowAPY - maxBorrowAPY).toFixed(4)
      ),
    }));

    // Sort by supply APY descending
    comparisonWithDeltas.sort((a, b) => b.supplyAPY - a.supplyAPY);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        comparison: comparisonWithDeltas,
        summary: {
          bestSupply: comparisonWithDeltas[0].symbol,
          bestSupplyAPY: maxSupplyAPY,
          bestBorrow: comparisonWithDeltas.find(
            (a) => a.borrowAPY === maxBorrowAPY
          )?.symbol,
          bestBorrowAPY: maxBorrowAPY,
        },
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to compare yields',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
