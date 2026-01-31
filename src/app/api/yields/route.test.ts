import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock dependencies before importing the route
vi.mock('@/lib/redis', () => ({
  isRedisConfigured: vi.fn(() => false),
  getYieldsCache: vi.fn(),
}));

vi.mock('@/lib/dynamic-fetcher', () => ({
  fetchAllAssetsYieldData: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => ({ success: true, headers: {} })),
  getClientIdentifier: vi.fn(() => 'test-client'),
  createRateLimitResponse: vi.fn(() => new Response('Rate limited', { status: 429 })),
}));

import { GET } from './route';
import { isRedisConfigured, getYieldsCache } from '@/lib/redis';
import { fetchAllAssetsYieldData } from '@/lib/dynamic-fetcher';
import { checkRateLimit } from '@/lib/rate-limit';

const mockAssets = [
  {
    symbol: 'USDC',
    address: '0x1234',
    category: 'Stablecoin',
    icon: '💵',
    supplyAPY: 3.5,
    borrowAPY: 5.0,
    totalSupply: '100000000',
    totalBorrow: '50000000',
    utilizationRate: 50,
    lastUpdated: Date.now(),
    isActive: true,
    borrowingEnabled: true,
  },
  {
    symbol: 'WETH',
    address: '0x5678',
    category: 'ETH & LST',
    icon: '💎',
    supplyAPY: 2.0,
    borrowAPY: 4.0,
    totalSupply: '50000000',
    totalBorrow: '25000000',
    utilizationRate: 50,
    lastUpdated: Date.now(),
    isActive: true,
    borrowingEnabled: true,
  },
];

describe('GET /api/yields', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, headers: {} });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return yields from RPC when cache is not configured', async () => {
    vi.mocked(isRedisConfigured).mockReturnValue(false);
    vi.mocked(fetchAllAssetsYieldData).mockResolvedValue(mockAssets);

    const request = new Request('http://localhost:3000/api/yields');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.dataSource).toBe('rpc');
    expect(data.assetCount).toBe(2);
    expect(data.assets).toHaveLength(2);
    expect(data.assets[0].symbol).toBe('USDC');
    expect(data.protocol).toBe('Aave V3');
  });

  it('should return yields from cache when available', async () => {
    vi.mocked(isRedisConfigured).mockReturnValue(true);
    vi.mocked(getYieldsCache).mockResolvedValue({
      assets: mockAssets,
      timestamp: '2026-01-31T12:00:00Z',
    });

    const request = new Request('http://localhost:3000/api/yields');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.dataSource).toBe('cache');
    expect(data.timestamp).toBe('2026-01-31T12:00:00Z');
    expect(fetchAllAssetsYieldData).not.toHaveBeenCalled();
  });

  it('should fallback to RPC when cache is empty', async () => {
    vi.mocked(isRedisConfigured).mockReturnValue(true);
    vi.mocked(getYieldsCache).mockResolvedValue(null);
    vi.mocked(fetchAllAssetsYieldData).mockResolvedValue(mockAssets);

    const request = new Request('http://localhost:3000/api/yields');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.dataSource).toBe('rpc');
    expect(fetchAllAssetsYieldData).toHaveBeenCalled();
  });

  it('should return rate limit error when rate limited', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, headers: { 'X-RateLimit-Remaining': '0' } });

    const request = new Request('http://localhost:3000/api/yields');
    const response = await GET(request);

    expect(response.status).toBe(429);
  });

  it('should return 500 on error', async () => {
    vi.mocked(isRedisConfigured).mockReturnValue(false);
    vi.mocked(fetchAllAssetsYieldData).mockRejectedValue(new Error('RPC Error'));

    const request = new Request('http://localhost:3000/api/yields');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch yield data');
  });

  it('should format APY values correctly', async () => {
    vi.mocked(isRedisConfigured).mockReturnValue(false);
    vi.mocked(fetchAllAssetsYieldData).mockResolvedValue([
      {
        ...mockAssets[0],
        supplyAPY: 3.12345678,
        borrowAPY: 5.98765432,
        utilizationRate: 45.6789,
      },
    ]);

    const request = new Request('http://localhost:3000/api/yields');
    const response = await GET(request);
    const data = await response.json();

    expect(data.assets[0].supplyAPY).toBe(3.1235);
    expect(data.assets[0].borrowAPY).toBe(5.9877);
    expect(data.assets[0].utilizationRate).toBe(45.68);
  });

  it('should include correct headers', async () => {
    vi.mocked(isRedisConfigured).mockReturnValue(false);
    vi.mocked(fetchAllAssetsYieldData).mockResolvedValue(mockAssets);

    const request = new Request('http://localhost:3000/api/yields');
    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
    expect(response.headers.get('X-Data-Source')).toBe('rpc');
    expect(response.headers.get('X-Latency-Ms')).toBeTruthy();
  });
});
