import { describe, it, expect } from 'vitest';
import { calculateRiskScore, calculateAllRiskScores, getInvestmentRecommendation } from './risk-score';
import type { AssetYieldData } from './dynamic-fetcher';

// Mock asset data for testing
const createMockAsset = (overrides: Partial<AssetYieldData> = {}): AssetYieldData => ({
  symbol: 'USDC',
  address: '0x1234567890abcdef',
  category: 'Stablecoin',
  icon: '💵',
  supplyAPY: 3.5,
  borrowAPY: 5.0,
  totalSupply: '100000000000000', // $100M
  totalBorrow: '50000000000000',
  utilizationRate: 50,
  lastUpdated: Date.now(),
  isActive: true,
  borrowingEnabled: true,
  ...overrides,
});

describe('calculateRiskScore', () => {
  describe('risk levels', () => {
    it('should return low risk for stablecoin with low utilization', () => {
      const asset = createMockAsset({
        symbol: 'USDC',
        category: 'Stablecoin',
        utilizationRate: 30,
        supplyAPY: 2.5,
      });

      const result = calculateRiskScore(asset);

      expect(result.level).toBe('low');
      expect(result.score).toBeLessThanOrEqual(30);
      expect(result.label).toBe('Low Risk');
      expect(result.emoji).toBe('🟢');
    });

    it('should return medium risk for moderate utilization', () => {
      const asset = createMockAsset({
        symbol: 'WETH',
        category: 'ETH & LST',
        utilizationRate: 75,
        supplyAPY: 4.0,
      });

      const result = calculateRiskScore(asset);

      expect(result.level).toBe('medium');
      expect(result.score).toBeGreaterThan(30);
      expect(result.score).toBeLessThanOrEqual(60);
      expect(result.label).toBe('Medium Risk');
      expect(result.emoji).toBe('🟡');
    });

    it('should return high risk for governance token with high utilization', () => {
      const asset = createMockAsset({
        symbol: 'UNI',
        category: 'Governance',
        utilizationRate: 92,
        supplyAPY: 8.0,
      });

      const result = calculateRiskScore(asset);

      expect(result.level).toBe('high');
      expect(result.score).toBeGreaterThan(60);
      expect(result.label).toBe('High Risk');
      expect(result.emoji).toBe('🔴');
    });
  });

  describe('utilization risk factor', () => {
    it('should have low utilization risk below 70%', () => {
      const asset = createMockAsset({ utilizationRate: 50 });
      const result = calculateRiskScore(asset);

      // 50 * 0.3 = 15 utilization risk (low)
      expect(result.factors.utilizationRisk).toBeLessThan(25);
    });

    it('should have medium utilization risk between 70-90%', () => {
      const asset = createMockAsset({ utilizationRate: 80 });
      const result = calculateRiskScore(asset);

      // 20 + (80-70)*2 = 40 (medium)
      expect(result.factors.utilizationRisk).toBeGreaterThanOrEqual(20);
      expect(result.factors.utilizationRisk).toBeLessThan(60);
    });

    it('should have high utilization risk above 90%', () => {
      const asset = createMockAsset({ utilizationRate: 95 });
      const result = calculateRiskScore(asset);

      // 60 + (95-90)*4 = 80 (high)
      expect(result.factors.utilizationRisk).toBeGreaterThanOrEqual(60);
    });
  });

  describe('asset category risk factor', () => {
    it('should have very low risk for stablecoins', () => {
      const asset = createMockAsset({ category: 'Stablecoin' });
      const result = calculateRiskScore(asset);

      expect(result.factors.assetRisk).toBe(10);
    });

    it('should have moderate risk for ETH & LST', () => {
      const asset = createMockAsset({ category: 'ETH & LST' });
      const result = calculateRiskScore(asset);

      expect(result.factors.assetRisk).toBe(30);
    });

    it('should have moderate-high risk for BTC', () => {
      const asset = createMockAsset({ category: 'BTC' });
      const result = calculateRiskScore(asset);

      expect(result.factors.assetRisk).toBe(40);
    });

    it('should have high risk for governance tokens', () => {
      const asset = createMockAsset({ category: 'Governance' });
      const result = calculateRiskScore(asset);

      expect(result.factors.assetRisk).toBe(70);
    });

    it('should have very high risk for unknown category', () => {
      const asset = createMockAsset({ category: 'Unknown' });
      const result = calculateRiskScore(asset);

      expect(result.factors.assetRisk).toBe(80);
    });
  });

  describe('volatility risk factor', () => {
    it('should have low volatility risk for low APY', () => {
      const asset = createMockAsset({ supplyAPY: 2.0 });
      const result = calculateRiskScore(asset);

      expect(result.factors.volatilityRisk).toBe(15);
    });

    it('should have moderate volatility risk for medium APY', () => {
      const asset = createMockAsset({ supplyAPY: 5.0 });
      const result = calculateRiskScore(asset);

      expect(result.factors.volatilityRisk).toBe(30);
    });

    it('should have high volatility risk for high APY', () => {
      const asset = createMockAsset({ supplyAPY: 8.0 });
      const result = calculateRiskScore(asset);

      expect(result.factors.volatilityRisk).toBe(50);
    });

    it('should have very high volatility risk for extremely high APY', () => {
      const asset = createMockAsset({ supplyAPY: 15.0 });
      const result = calculateRiskScore(asset);

      expect(result.factors.volatilityRisk).toBe(70);
    });
  });

  describe('liquidity risk factor', () => {
    it('should have low liquidity risk for high TVL', () => {
      const asset = createMockAsset({
        symbol: 'USDC',
        totalSupply: '500000000000000', // Very high supply
      });
      const result = calculateRiskScore(asset);

      expect(result.factors.liquidityRisk).toBeLessThanOrEqual(30);
    });

    it('should have higher liquidity risk for low TVL', () => {
      const asset = createMockAsset({
        symbol: 'USDC',
        totalSupply: '500000', // Low supply
      });
      const result = calculateRiskScore(asset);

      expect(result.factors.liquidityRisk).toBeGreaterThanOrEqual(50);
    });
  });

  describe('warnings', () => {
    it('should add utilization warning for very high utilization', () => {
      // Warning is triggered when utilizationRisk > 70
      // This needs utilizationRate > 92.5 (60 + (x-90)*4 > 70 => x > 92.5)
      const asset = createMockAsset({ utilizationRate: 95 });
      const result = calculateRiskScore(asset);

      expect(result.warnings).toContain(
        'High utilization - withdrawals may be difficult during high demand'
      );
    });

    it('should add asset warning for governance tokens', () => {
      const asset = createMockAsset({ category: 'Governance' });
      const result = calculateRiskScore(asset);

      expect(result.warnings).toContain(
        'Volatile asset - value can fluctuate significantly'
      );
    });

    it('should have no warnings for safe stablecoin', () => {
      const asset = createMockAsset({
        category: 'Stablecoin',
        utilizationRate: 30,
        supplyAPY: 2.5,
      });
      const result = calculateRiskScore(asset);

      expect(result.warnings.length).toBe(0);
    });
  });

  describe('recommendations', () => {
    it('should recommend safe assets for beginners', () => {
      const asset = createMockAsset({
        category: 'Stablecoin',
        utilizationRate: 30,
        supplyAPY: 2.5,
      });
      const result = calculateRiskScore(asset);

      expect(result.recommendation).toContain('safe choice');
      expect(result.recommendation).toContain('beginners');
    });

    it('should mention higher risk for volatile assets', () => {
      // Need score > 60 for high risk recommendation
      // Governance (70 * 0.3 = 21) + high util (60+ * 0.4 = 24+) + high APY (50 * 0.2 = 10)
      const asset = createMockAsset({
        category: 'Governance',
        utilizationRate: 95, // Very high utilization needed
        supplyAPY: 12.0, // Very high APY
      });
      const result = calculateRiskScore(asset);

      expect(result.level).toBe('high');
      expect(result.recommendation).toContain('higher risk');
      expect(result.recommendation).toContain('experienced');
    });
  });
});

describe('calculateAllRiskScores', () => {
  it('should calculate scores for multiple assets', () => {
    const assets: AssetYieldData[] = [
      createMockAsset({ symbol: 'USDC', category: 'Stablecoin' }),
      createMockAsset({ symbol: 'WETH', category: 'ETH & LST' }),
      createMockAsset({ symbol: 'UNI', category: 'Governance' }),
    ];

    const scores = calculateAllRiskScores(assets);

    expect(scores.size).toBe(3);
    expect(scores.has('USDC')).toBe(true);
    expect(scores.has('WETH')).toBe(true);
    expect(scores.has('UNI')).toBe(true);
  });

  it('should return correct scores for each asset', () => {
    const assets: AssetYieldData[] = [
      createMockAsset({ symbol: 'USDC', category: 'Stablecoin', utilizationRate: 30, supplyAPY: 2.5 }),
      createMockAsset({ symbol: 'UNI', category: 'Governance', utilizationRate: 95, supplyAPY: 12.0 }),
    ];

    const scores = calculateAllRiskScores(assets);

    expect(scores.get('USDC')?.level).toBe('low');
    expect(scores.get('UNI')?.level).toBe('high');
  });
});

describe('getInvestmentRecommendation', () => {
  const allAssets: AssetYieldData[] = [
    createMockAsset({ symbol: 'USDC', category: 'Stablecoin', supplyAPY: 3.5 }),
    createMockAsset({ symbol: 'USDT', category: 'Stablecoin', supplyAPY: 3.2 }),
    createMockAsset({ symbol: 'WETH', category: 'ETH & LST', supplyAPY: 2.0 }),
  ];

  it('should recommend matching asset if user has it', () => {
    const result = getInvestmentRecommendation('USDC', 1000, allAssets);

    expect(result.recommendedAsset.symbol).toBe('USDC');
    expect(result.projectedEarnings.yearly).toBeCloseTo(35, 0);
  });

  it('should recommend best stablecoin for non-matching token', () => {
    const result = getInvestmentRecommendation('ETH', 1000, allAssets);

    // Should recommend USDC (highest APY stablecoin)
    expect(result.recommendedAsset.symbol).toBe('USDC');
  });

  it('should calculate correct projected earnings', () => {
    const result = getInvestmentRecommendation('USDC', 1000, allAssets);

    // 1000 * 3.5% = $35/year
    expect(result.projectedEarnings.yearly).toBeCloseTo(35, 1);
    expect(result.projectedEarnings.monthly).toBeCloseTo(35 / 12, 1);
    expect(result.projectedEarnings.daily).toBeCloseTo(35 / 365, 2);
  });

  it('should include risk score in recommendation', () => {
    const result = getInvestmentRecommendation('USDC', 1000, allAssets);

    expect(result.riskScore).toBeDefined();
    expect(result.riskScore.level).toBe('low');
  });

  it('should generate helpful message', () => {
    const result = getInvestmentRecommendation('USDC', 1000, allAssets);

    expect(result.message).toContain('USDC');
    expect(result.message).toContain('1000');
    expect(result.message).toContain('3.5');
  });
});
