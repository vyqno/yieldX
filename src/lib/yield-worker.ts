/**
 * Yield Worker
 * 
 * Background worker that:
 * 1. Listens to Aave events
 * 2. Fetches fresh data via RPC
 * 3. Updates Redis cache
 * 4. Broadcasts via WebSocket
 * 
 * This is the core of the real-time system.
 */

import { fetchAllAssetsYieldData } from "./dynamic-fetcher";
import { setYieldsCache, getYieldsCache, isRedisConfigured } from "./redis";
import { broadcastYieldUpdate, initBroadcastChannel, isBroadcastConfigured } from "./broadcast";
import { listenToAaveEvents } from "./event-listener";

// Worker state
let isRunning = false;
let unsubscribeEvents: (() => void) | null = null;
let debounceTimeout: NodeJS.Timeout | null = null;
let isProcessing = false;
let startTime: Date | null = null;
let lastUpdateTime: Date | null = null;
let totalUpdates = 0;
let failedUpdates = 0;
let consecutiveFailures = 0;

// Debounce delay (500ms) to batch multiple events
const DEBOUNCE_MS = 500;

// Max consecutive failures before giving up
const MAX_CONSECUTIVE_FAILURES = 5;

// Auto-restart delay after crash
const AUTO_RESTART_DELAY_MS = 10000; // 10 seconds

/**
 * Fetch data, update cache, and broadcast
 */
async function processUpdate(trigger: string): Promise<void> {
  // Prevent concurrent processing
  if (isProcessing) {
    console.log('[Worker] Already processing, skipping duplicate update');
    return;
  }

  isProcessing = true;

  try {
    console.log(`[Worker] Processing update, trigger: ${trigger}`);

    // Fetch fresh data from RPC
    const assets = await fetchAllAssetsYieldData();
    const timestamp = new Date().toISOString();

    // Update Redis cache
    if (isRedisConfigured()) {
      await setYieldsCache(assets);
    }

    // Broadcast to WebSocket subscribers
    if (isBroadcastConfigured()) {
      await broadcastYieldUpdate({
        assets,
        timestamp,
        trigger,
      });
    }

    console.log(`[Worker] Update complete: ${assets.length} assets`);

    // Track success
    totalUpdates++;
    lastUpdateTime = new Date();
    consecutiveFailures = 0; // Reset on success
  } catch (error) {
    console.error('[Worker] Update failed:', error);
    failedUpdates++;
    consecutiveFailures++;

    // Too many failures - stop worker and attempt restart
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error(
        `[Worker] ${consecutiveFailures} consecutive failures, stopping worker`
      );
      stopYieldWorker();
      scheduleAutoRestart();
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Debounced update - batches multiple events
 * Fixed race condition by storing timeout reference before clearing
 */
function debouncedUpdate(trigger: string): void {
  // Clear existing timeout
  if (debounceTimeout !== null) {
    clearTimeout(debounceTimeout);
  }

  debounceTimeout = setTimeout(async () => {
    const currentTimeout = debounceTimeout;

    // Check if this timeout was already cleared
    if (currentTimeout === null) {
      return;
    }

    await processUpdate(trigger);
    debounceTimeout = null;
  }, DEBOUNCE_MS);
}

/**
 * Schedule auto-restart after crash
 */
function scheduleAutoRestart(): void {
  console.log(`[Worker] Scheduling auto-restart in ${AUTO_RESTART_DELAY_MS}ms`);

  setTimeout(async () => {
    console.log('[Worker] Attempting auto-restart...');
    try {
      await startYieldWorker();
      console.log('[Worker] Auto-restart successful');
    } catch (error) {
      console.error('[Worker] Auto-restart failed:', error);
      // Don't schedule another restart to prevent infinite loop
    }
  }, AUTO_RESTART_DELAY_MS);
}

/**
 * Start the yield worker
 */
export async function startYieldWorker(): Promise<void> {
  if (isRunning) {
    console.log('[Worker] Already running');
    return;
  }

  console.log('[Worker] Starting...');
  isRunning = true;
  startTime = new Date();
  totalUpdates = 0;
  failedUpdates = 0;
  consecutiveFailures = 0;

  try {
    // Initialize broadcast channel
    if (isBroadcastConfigured()) {
      initBroadcastChannel();
    }

    // Initial data fetch
    await processUpdate('startup');

    // Start listening to events
    unsubscribeEvents = listenToAaveEvents((event) => {
      console.log(`[Worker] Event received: ${event.eventName}`);
      debouncedUpdate(event.eventName);
    });

    console.log('[Worker] Started successfully');
  } catch (error) {
    console.error('[Worker] Failed to start:', error);
    isRunning = false;
    throw error;
  }
}

// Alias for backward compatibility
export const startWorker = startYieldWorker;

/**
 * Stop the yield worker
 */
export function stopYieldWorker(): void {
  if (!isRunning) return;
  
  if (unsubscribeEvents) {
    unsubscribeEvents();
    unsubscribeEvents = null;
  }
  
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }
  
  isRunning = false;
  console.log("[Worker] Stopped");
}

/**
 * Get worker status
 */
export function getWorkerStatus(): {
  isRunning: boolean;
  redisConfigured: boolean;
  broadcastConfigured: boolean;
  uptime: number | null;
  totalUpdates: number;
  failedUpdates: number;
  consecutiveFailures: number;
  lastUpdateTime: string | null;
  isProcessing: boolean;
} {
  return {
    isRunning,
    redisConfigured: isRedisConfigured(),
    broadcastConfigured: isBroadcastConfigured(),
    uptime: startTime ? Date.now() - startTime.getTime() : null,
    totalUpdates,
    failedUpdates,
    consecutiveFailures,
    lastUpdateTime: lastUpdateTime ? lastUpdateTime.toISOString() : null,
    isProcessing,
  };
}

/**
 * Manual refresh (for debugging)
 */
export async function manualRefresh(): Promise<void> {
  await processUpdate("manual");
}

/**
 * Get cached data (for API)
 */
export async function getCachedYields() {
  return getYieldsCache();
}
