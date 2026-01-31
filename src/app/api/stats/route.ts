/**
 * Platform Statistics Endpoint
 *
 * GET /api/stats
 *
 * Returns platform-wide statistics and analytics:
 * - Total assets tracked
 * - Average yields by category
 * - Market distribution
 * - Platform uptime
 */

import { NextResponse } from 'next/server';
import { getYieldsCache } from '@/lib/redis';
import { fetchAllAssetsYieldData } from '@/lib/dynamic-fetcher';
import { getWorkerStatus } from '@/lib/yield-worker';
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

    // Get yield data
    const cached = await getYieldsCache();
    const assets = cached?.assets || (await fetchAllAssetsYieldData());

    // Calculate statistics
    const totalAssets = assets.length;
    const activeAssets = assets.filter((a) => a.isActive).length;

    // Group by category
    const categoryStats = new Map<
      string,
      { count: number; avgSupplyAPY: number; avgBorrowAPY: number }
    >();

    assets.forEach((asset) => {
      if (!categoryStats.has(asset.category)) {
        categoryStats.set(asset.category, {
          count: 0,
          avgSupplyAPY: 0,
          avgBorrowAPY: 0,
        });
      }

      const stats = categoryStats.get(asset.category)!;
      stats.count++;
      stats.avgSupplyAPY += asset.supplyAPY;
      stats.avgBorrowAPY += asset.borrowAPY;
    });

    // Calculate averages
    const categorySummary = Array.from(categoryStats.entries()).map(
      ([category, stats]) => ({
        category,
        assetCount: stats.count,
        averageSupplyAPY: parseFloat(
          (stats.avgSupplyAPY / stats.count).toFixed(4)
        ),
        averageBorrowAPY: parseFloat(
          (stats.avgBorrowAPY / stats.count).toFixed(4)
        ),
      })
    );

    // Overall statistics
    const totalSupplyAPY = assets.reduce(
      (sum, asset) => sum + asset.supplyAPY,
      0
    );
    const totalBorrowAPY = assets.reduce(
      (sum, asset) => sum + asset.borrowAPY,
      0
    );

    const workerStatus = getWorkerStatus();

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        platform: {
          protocol: 'Aave V3',
          chain: 'ethereum',
          chainId: 1,
        },
        overview: {
          totalAssets,
          activeAssets,
          averageSupplyAPY: parseFloat(
            (totalSupplyAPY / totalAssets).toFixed(4)
          ),
          averageBorrowAPY: parseFloat(
            (totalBorrowAPY / totalAssets).toFixed(4)
          ),
          highestSupplyAPY: Math.max(...assets.map((a) => a.supplyAPY)),
          lowestSupplyAPY: Math.min(
            ...assets.filter((a) => a.supplyAPY > 0).map((a) => a.supplyAPY)
          ),
        },
        categories: categorySummary,
        worker: {
          status: workerStatus.isRunning ? 'running' : 'stopped',
          uptime: workerStatus.uptime,
          totalUpdates: workerStatus.totalUpdates,
          failedUpdates: workerStatus.failedUpdates,
          lastUpdate: workerStatus.lastUpdateTime,
        },
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
