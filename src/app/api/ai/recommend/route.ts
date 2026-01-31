/**
 * AI Investment Recommendations API
 *
 * POST /api/ai/recommend
 *
 * Analyzes user's wallet and suggests best investment options.
 *
 * Request body:
 * {
 *   "userAddress": "0x...",
 *   "tokens": [
 *     { "symbol": "USDC", "balance": 5000, "balanceUSD": 5000 }
 *   ]
 * }
 *
 * Response:
 * {
 *   "recommendations": [
 *     {
 *       "token": "USDC",
 *       "suggestedPool": "Aave V3 USDC",
 *       "apy": 3.88,
 *       "riskScore": 15,
 *       "projectedEarnings": { daily: 0.53, monthly: 16.17, yearly: 194 },
 *       "message": "...",
 *       "action": "deposit"
 *     }
 *   ]
 * }
 */

import { NextResponse } from 'next/server';
import { getYieldsCache } from '@/lib/redis';
import { fetchAllAssetsYieldData } from '@/lib/dynamic-fetcher';
import {
  calculateRiskScore,
  getInvestmentRecommendation,
} from '@/lib/risk-score';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface UserToken {
  symbol: string;
  balance: number;
  balanceUSD: number;
}

interface RequestBody {
  userAddress: string;
  tokens: UserToken[];
}

export async function POST(request: Request) {
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

    // Parse request body
    const body: RequestBody = await request.json();

    if (!body.userAddress || !body.tokens || body.tokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          message:
            'Please provide userAddress and tokens array with at least one token',
        },
        { status: 400 }
      );
    }

    // Get yield data
    const cached = await getYieldsCache();
    const allAssets = cached?.assets || (await fetchAllAssetsYieldData());

    // Generate recommendations for each token
    const recommendations = body.tokens.map((userToken) => {
      const recommendation = getInvestmentRecommendation(
        userToken.symbol,
        userToken.balanceUSD,
        allAssets
      );

      return {
        userToken: {
          symbol: userToken.symbol,
          balance: userToken.balance,
          balanceUSD: userToken.balanceUSD,
        },
        suggestedPool: {
          symbol: recommendation.recommendedAsset.symbol,
          address: recommendation.recommendedAsset.address,
          category: recommendation.recommendedAsset.category,
          supplyAPY: parseFloat(
            recommendation.recommendedAsset.supplyAPY.toFixed(4)
          ),
        },
        riskScore: {
          score: recommendation.riskScore.score,
          level: recommendation.riskScore.level,
          label: recommendation.riskScore.label,
          emoji: recommendation.riskScore.emoji,
          warnings: recommendation.riskScore.warnings,
        },
        projectedEarnings: {
          daily: parseFloat(recommendation.projectedEarnings.daily.toFixed(2)),
          monthly: parseFloat(
            recommendation.projectedEarnings.monthly.toFixed(2)
          ),
          yearly: parseFloat(
            recommendation.projectedEarnings.yearly.toFixed(2)
          ),
        },
        message: recommendation.message,
        action: {
          type: 'deposit',
          contract: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Aave V3 Pool
          method: 'supply',
          params: {
            asset: recommendation.recommendedAsset.address,
            amount: userToken.balance.toString(),
            onBehalfOf: body.userAddress,
            referralCode: 0,
          },
        },
      };
    });

    // Sort by projected yearly earnings (best first)
    recommendations.sort(
      (a, b) => b.projectedEarnings.yearly - a.projectedEarnings.yearly
    );

    // Calculate total portfolio value and earnings
    const totalPortfolioUSD = body.tokens.reduce(
      (sum, t) => sum + t.balanceUSD,
      0
    );
    const totalYearlyEarnings = recommendations.reduce(
      (sum, r) => sum + r.projectedEarnings.yearly,
      0
    );

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        userAddress: body.userAddress,
        portfolio: {
          totalValueUSD: parseFloat(totalPortfolioUSD.toFixed(2)),
          tokenCount: body.tokens.length,
          projectedYearlyEarnings: parseFloat(
            totalYearlyEarnings.toFixed(2)
          ),
          averageAPY: parseFloat(
            ((totalYearlyEarnings / totalPortfolioUSD) * 100).toFixed(4)
          ),
        },
        recommendations,
        summary: {
          bestOpportunity: recommendations[0],
          safestOption: recommendations.reduce((safest, current) =>
            current.riskScore.score < safest.riskScore.score
              ? current
              : safest
          ),
        },
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
