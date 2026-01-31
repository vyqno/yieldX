/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Returns system health status including:
 * - Worker status
 * - Redis connectivity
 * - WebSocket status
 * - Last update time
 */

import { NextResponse } from 'next/server';
import { getWorkerStatus } from '@/lib/yield-worker';
import { getCacheTimestamp, isRedisConfigured } from '@/lib/redis';
import { isBroadcastConfigured } from '@/lib/broadcast';

export const dynamic = 'force-dynamic';

export async function GET() {
  const workerStatus = getWorkerStatus();
  const cacheTimestamp = await getCacheTimestamp();

  const health = {
    status: workerStatus.isRunning ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    components: {
      worker: {
        status: workerStatus.isRunning ? 'up' : 'down',
        uptime: workerStatus.uptime,
        totalUpdates: workerStatus.totalUpdates,
        failedUpdates: workerStatus.failedUpdates,
        lastUpdate: workerStatus.lastUpdateTime,
      },
      redis: {
        status: isRedisConfigured() ? 'up' : 'down',
        lastCacheUpdate: cacheTimestamp,
      },
      websocket: {
        status: isBroadcastConfigured() ? 'up' : 'down',
      },
    },
    version: '1.0.0',
    protocol: 'Aave V3',
    chain: 'ethereum',
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
