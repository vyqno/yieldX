/**
 * Risk Scoring API
 *
 * GET /api/risk
 * GET /api/risk?symbol=USDC
 *
 * Returns risk scores for all assets or a specific asset.
 */

import { NextResponse } from 'next/server';
import { getYieldsCache } from '@/lib/redis';
import { fetchAllAssetsYieldData } from '@/lib/dynamic-fetcher';
import {
  calculateRiskScore,
  calculateAllRiskScores,
} from '@/lib/risk-score';
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
    const symbolFilter = searchParams.get('symbol');

    // Get yield data
    const cached = await getYieldsCache();
    const assets = cached?.assets || (await fetchAllAssetsYieldData());

    if (symbolFilter) {
      // Single asset risk score
      const asset = assets.find(
        (a) => a.symbol.toLowerCase() === symbolFilter.toLowerCase()
      );

      if (!asset) {
        return NextResponse.json(
          {
            success: false,
            error: 'Asset not found',
            message: `Asset '${symbolFilter}' not found`,
          },
          { status: 404 }
        );
      }

      const riskScore = calculateRiskScore(asset);

      return NextResponse.json(
        {
          success: true,
          timestamp: new Date().toISOString(),
          asset: {
            symbol: asset.symbol,
            category: asset.category,
            supplyAPY: asset.supplyAPY,
          },
          riskScore,
        },
        { headers: rateLimitHeaders }
      );
    } else {
      // All assets risk scores
      const allRiskScores = calculateAllRiskScores(assets);

      const results = assets.map((asset) => ({
        symbol: asset.symbol,
        category: asset.category,
        supplyAPY: parseFloat(asset.supplyAPY.toFixed(4)),
        riskScore: allRiskScores.get(asset.symbol)!.score,
        riskLevel: allRiskScores.get(asset.symbol)!.level,
        riskLabel: allRiskScores.get(asset.symbol)!.label,
        emoji: allRiskScores.get(asset.symbol)!.emoji,
        recommendation: allRiskScores.get(asset.symbol)!.recommendation,
      }));

      // Sort by risk score (safest first)
      results.sort((a, b) => a.riskScore - b.riskScore);

      return NextResponse.json(
        {
          success: true,
          timestamp: new Date().toISOString(),
          count: results.length,
          riskScores: results,
          summary: {
            safest: results[0],
            riskiest: results[results.length - 1],
            averageRisk:
              results.reduce((sum, r) => sum + r.riskScore, 0) /
              results.length,
          },
        },
        { headers: rateLimitHeaders }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate risk scores',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
