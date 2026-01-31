/**
 * Risk Scoring Algorithm for Aave V3 Pools
 *
 * Calculates a 0-100 risk score where:
 * - 0-30: Low Risk (Safe for beginners)
 * - 31-60: Medium Risk (Moderate caution)
 * - 61-100: High Risk (Advanced users only)
 *
 * Factors:
 * 1. Utilization Rate (40% weight) - High utilization = liquidity risk
 * 2. Asset Category (30% weight) - Stablecoins safer than governance tokens
 * 3. APY Volatility (20% weight) - Stable APY = predictable, volatile = risky
 * 4. Liquidity Depth (10% weight) - Low liquidity = harder to withdraw
 */

import type { AssetYieldData } from './dynamic-fetcher';

export interface RiskScore {
  score: number; // 0-100
  level: 'low' | 'medium' | 'high';
  label: string;
  color: string;
  emoji: string;
  factors: {
    utilizationRisk: number;
    assetRisk: number;
    volatilityRisk: number;
    liquidityRisk: number;
  };
  warnings: string[];
  recommendation: string;
}

/**
 * Calculate comprehensive risk score for an asset
 */
export function calculateRiskScore(
  asset: AssetYieldData,
  historicalAPY?: number[] // Optional: last 30 days of APY data
): RiskScore {
  const factors = {
    utilizationRisk: calculateUtilizationRisk(asset.utilizationRate),
    assetRisk: calculateAssetCategoryRisk(asset.category),
    volatilityRisk: calculateVolatilityRisk(
      asset.supplyAPY,
      historicalAPY || []
    ),
    liquidityRisk: calculateLiquidityRisk(asset.totalSupply, asset.symbol),
  };

  // Weighted risk score (0-100)
  const score = Math.round(
    factors.utilizationRisk * 0.4 + // 40% weight
      factors.assetRisk * 0.3 + // 30% weight
      factors.volatilityRisk * 0.2 + // 20% weight
      factors.liquidityRisk * 0.1 // 10% weight
  );

  // Determine risk level
  let level: 'low' | 'medium' | 'high';
  let label: string;
  let color: string;
  let emoji: string;

  if (score <= 30) {
    level = 'low';
    label = 'Low Risk';
    color = '#10b981'; // green
    emoji = '🟢';
  } else if (score <= 60) {
    level = 'medium';
    label = 'Medium Risk';
    color = '#f59e0b'; // orange
    emoji = '🟡';
  } else {
    level = 'high';
    label = 'High Risk';
    color = '#ef4444'; // red
    emoji = '🔴';
  }

  // Generate warnings
  const warnings: string[] = [];
  if (factors.utilizationRisk > 70) {
    warnings.push(
      'High utilization - withdrawals may be difficult during high demand'
    );
  }
  if (factors.assetRisk > 60) {
    warnings.push('Volatile asset - value can fluctuate significantly');
  }
  if (factors.volatilityRisk > 50) {
    warnings.push('APY has been unstable - earnings may vary');
  }
  if (factors.liquidityRisk > 50) {
    warnings.push('Lower liquidity - large withdrawals may impact rates');
  }

  // Generate recommendation
  const recommendation = generateRecommendation(score, asset);

  return {
    score,
    level,
    label,
    color,
    emoji,
    factors,
    warnings,
    recommendation,
  };
}

/**
 * Utilization Risk (0-100)
 *
 * Formula: Risk increases exponentially above 80% utilization
 * - <70%: Low risk (0-20)
 * - 70-90%: Medium risk (20-60)
 * - >90%: High risk (60-100)
 */
function calculateUtilizationRisk(utilizationRate: number): number {
  if (utilizationRate < 70) {
    // Low risk zone
    return utilizationRate * 0.3; // Max 21
  } else if (utilizationRate < 90) {
    // Medium risk zone - accelerating
    const above70 = utilizationRate - 70;
    return 20 + above70 * 2; // 20-60
  } else {
    // High risk zone - exponential
    const above90 = utilizationRate - 90;
    return 60 + above90 * 4; // 60-100
  }
}

/**
 * Asset Category Risk (0-100)
 *
 * Based on historical volatility and smart contract risk:
 * - Stablecoins: 0-20 (safest)
 * - ETH & LST: 20-40 (moderate)
 * - BTC: 30-50 (moderate-high)
 * - Governance: 60-80 (high)
 * - Other: 70-90 (very high)
 */
function calculateAssetCategoryRisk(category: string): number {
  const categoryLower = category.toLowerCase();

  if (categoryLower.includes('stablecoin')) {
    return 10; // Very safe
  } else if (categoryLower.includes('eth') || categoryLower.includes('lst')) {
    return 30; // Ethereum-related, relatively stable
  } else if (categoryLower.includes('btc')) {
    return 40; // Bitcoin-wrapped, moderate
  } else if (categoryLower.includes('governance')) {
    return 70; // Governance tokens are volatile
  } else {
    return 80; // Unknown category, assume high risk
  }
}

/**
 * Volatility Risk (0-100)
 *
 * Measures how stable the APY is over time.
 * More stable = more predictable earnings.
 *
 * If no historical data, use current APY as indicator:
 * - <3% APY: Very stable (0-20)
 * - 3-6% APY: Moderate (20-40)
 * - >6% APY: May indicate instability (40-80)
 */
function calculateVolatilityRisk(
  currentAPY: number,
  historicalAPY: number[]
): number {
  if (historicalAPY.length > 0) {
    // Calculate standard deviation of APY
    const mean = historicalAPY.reduce((sum, apy) => sum + apy, 0) / historicalAPY.length;
    const variance =
      historicalAPY.reduce((sum, apy) => sum + Math.pow(apy - mean, 2), 0) /
      historicalAPY.length;
    const stdDev = Math.sqrt(variance);

    // Map standard deviation to 0-100 scale
    // StdDev > 2% = very volatile (high risk)
    return Math.min(stdDev * 40, 100);
  } else {
    // Fallback: Use current APY as proxy
    if (currentAPY < 3) {
      return 15; // Stable, low yield
    } else if (currentAPY < 6) {
      return 30; // Moderate yield
    } else if (currentAPY < 10) {
      return 50; // High yield, potentially volatile
    } else {
      return 70; // Very high yield, likely unstable
    }
  }
}

/**
 * Liquidity Risk (0-100)
 *
 * Low liquidity = harder to withdraw large amounts.
 *
 * Based on total supply in pool:
 * - >$100M: Very liquid (0-20)
 * - $10M-$100M: Moderate (20-40)
 * - <$10M: Low liquidity (40-80)
 */
function calculateLiquidityRisk(totalSupplyRaw: string, symbol: string): number {
  // Estimate USD value (simplified - would need price oracle in production)
  const decimals = getAssetDecimals(symbol);
  const totalSupply = Number(totalSupplyRaw) / Math.pow(10, decimals);

  // Rough USD estimate (assume $1 for stablecoins, need price feed for others)
  const estimatedUSD = totalSupply; // Simplified

  if (estimatedUSD > 100_000_000) {
    return 10; // Very liquid
  } else if (estimatedUSD > 10_000_000) {
    return 30; // Moderate liquidity
  } else if (estimatedUSD > 1_000_000) {
    return 50; // Low liquidity
  } else {
    return 70; // Very low liquidity
  }
}

/**
 * Get asset decimals (simplified - would query from contract in production)
 */
function getAssetDecimals(symbol: string): number {
  if (['USDC', 'USDT'].includes(symbol)) return 6;
  if (symbol === 'WBTC') return 8;
  return 18; // Default for most ERC20
}

/**
 * Generate human-readable recommendation
 */
function generateRecommendation(score: number, asset: AssetYieldData): string {
  if (score <= 30) {
    return `${asset.symbol} is a safe choice for beginners. Earn ${asset.supplyAPY.toFixed(2)}% APY with minimal risk.`;
  } else if (score <= 60) {
    return `${asset.symbol} offers ${asset.supplyAPY.toFixed(2)}% APY with moderate risk. Suitable for users who understand DeFi.`;
  } else {
    return `${asset.symbol} has ${asset.supplyAPY.toFixed(2)}% APY but carries higher risk. Only recommended for experienced users.`;
  }
}

/**
 * Batch calculate risk scores for all assets
 */
export function calculateAllRiskScores(
  assets: AssetYieldData[]
): Map<string, RiskScore> {
  const scores = new Map<string, RiskScore>();

  assets.forEach((asset) => {
    const riskScore = calculateRiskScore(asset);
    scores.set(asset.symbol, riskScore);
  });

  return scores;
}

/**
 * Get investment recommendation based on user's token balance
 */
export function getInvestmentRecommendation(
  userTokenSymbol: string,
  userBalanceUSD: number,
  allAssets: AssetYieldData[]
): {
  recommendedAsset: AssetYieldData;
  riskScore: RiskScore;
  projectedEarnings: {
    daily: number;
    monthly: number;
    yearly: number;
  };
  message: string;
} {
  // Find matching asset or best alternative
  let recommendedAsset = allAssets.find(
    (a) => a.symbol === userTokenSymbol
  );

  // If user has non-yield-bearing token, suggest best stablecoin
  if (!recommendedAsset) {
    recommendedAsset = allAssets
      .filter((a) => a.category === 'Stablecoin')
      .sort((a, b) => b.supplyAPY - a.supplyAPY)[0];
  }

  const riskScore = calculateRiskScore(recommendedAsset);
  const yearlyEarnings = (userBalanceUSD * recommendedAsset.supplyAPY) / 100;

  return {
    recommendedAsset,
    riskScore,
    projectedEarnings: {
      daily: yearlyEarnings / 365,
      monthly: yearlyEarnings / 12,
      yearly: yearlyEarnings,
    },
    message: `Invest your ${userTokenSymbol} (${userBalanceUSD.toFixed(2)} USD) in Aave ${recommendedAsset.symbol} pool to earn ${yearlyEarnings.toFixed(2)} USD/year (${recommendedAsset.supplyAPY.toFixed(2)}% APY). Risk: ${riskScore.label}.`,
  };
}
