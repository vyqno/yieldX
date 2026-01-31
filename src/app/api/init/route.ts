/**
 * Worker Initialization Endpoint
 *
 * Auto-starts the yield worker on first request or deployment.
 * Called automatically by Vercel cron or manually for debugging.
 */

import { NextResponse } from 'next/server';
import { startWorker, getWorkerStatus } from '@/lib/yield-worker';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const status = getWorkerStatus();

    if (status.isRunning) {
      return NextResponse.json({
        success: true,
        message: 'Worker already running',
        status,
        timestamp: new Date().toISOString(),
      });
    }

    // Start worker
    console.log('[Init] Starting yield worker...');
    await startWorker();

    return NextResponse.json({
      success: true,
      message: 'Worker started successfully',
      status: getWorkerStatus(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Init] Failed to start worker:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize worker',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Same as GET, just different method for flexibility
  return GET();
}
