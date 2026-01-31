/**
 * Assets List Endpoint
 *
 * GET /api/assets
 *
 * Returns list of all tracked assets with metadata (no yield data).
 * Useful for discovering available symbols before querying yields.
 *
 * Query params:
 * - category: Filter by category (e.g., "Stablecoin", "Volatile")
 */

import { NextResponse } from 'next/server';
import { TRACKED_ASSETS } from '@/lib/constants';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
  const categoryFilter = searchParams.get('category');

  let assets = TRACKED_ASSETS;

  // Apply category filter (using 'type' field from TOKENS)
  if (categoryFilter) {
    assets = assets.filter(
      (asset) =>
        asset.type.toLowerCase() === categoryFilter.toLowerCase()
    );
  }

  return NextResponse.json(
    {
      success: true,
      timestamp: new Date().toISOString(),
      count: assets.length,
      categories: [...new Set(TRACKED_ASSETS.map((a) => a.type))],
      assets: assets.map((asset) => ({
        symbol: asset.symbol,
        address: asset.address,
        category: asset.type,
        decimals: asset.decimals,
        icon: asset.icon,
        name: asset.name,
      })),
    },
    { headers: rateLimitHeaders }
  );
}
