/**
 * WebSocket Broadcast (Supabase Realtime)
 *
 * Broadcasts yield updates to all connected developers.
 * Uses Supabase Realtime channel broadcasting.
 *
 * Channel: yields
 * Event: update
 */

import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import type { AssetYieldData } from "./dynamic-fetcher";
import { ENV } from "./env";

// Create service client for broadcasting
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseServiceKey
  ? createClient(ENV.SUPABASE_URL, supabaseServiceKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Channel reference and state
let yieldsChannel: RealtimeChannel | null = null;
let reconnectAttempts = 0;
let isConnected = false;
let heartbeatInterval: NodeJS.Timeout | null = null;

const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds

/**
 * Check if broadcast is available
 */
export function isBroadcastConfigured(): boolean {
  return supabaseAdmin !== null;
}

/**
 * Get broadcast connection status
 */
export function getBroadcastStatus() {
  return {
    isConnected,
    reconnectAttempts,
    channelActive: yieldsChannel !== null,
  };
}

/**
 * Initialize the broadcast channel with error recovery
 */
export function initBroadcastChannel(): void {
  if (!supabaseAdmin) {
    console.warn('[Broadcast] Supabase not configured');
    return;
  }

  yieldsChannel = supabaseAdmin.channel('yields', {
    config: {
      broadcast: { self: false },
    },
  });

  yieldsChannel.subscribe((status) => {
    console.log(`[Broadcast] Channel status: ${status}`);

    if (status === 'SUBSCRIBED') {
      isConnected = true;
      reconnectAttempts = 0;
      console.log('✅ [Broadcast] Connected successfully');

      // Start heartbeat
      startHeartbeat();

      // Broadcast connection event
      broadcastConnectionStatus('connected');
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      isConnected = false;
      console.error('❌ [Broadcast] Connection error, attempting reconnect...');
      handleReconnect();
    } else if (status === 'CLOSED') {
      isConnected = false;
      console.warn('[Broadcast] Channel closed');
      stopHeartbeat();
    }
  });

  console.log('[Broadcast] Channel initialized');
}

/**
 * Handle WebSocket reconnection with exponential backoff
 */
function handleReconnect(): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('[Broadcast] Max reconnect attempts reached');
    stopHeartbeat();
    // TODO: Send alert to monitoring system
    return;
  }

  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);

  console.log(
    `[Broadcast] Reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`
  );

  setTimeout(() => {
    console.log('[Broadcast] Attempting to reconnect...');
    closeBroadcastChannel();
    initBroadcastChannel();
  }, delay);
}

/**
 * Start heartbeat to keep connection alive
 */
function startHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  heartbeatInterval = setInterval(async () => {
    if (yieldsChannel && isConnected) {
      try {
        await yieldsChannel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: {
            timestamp: new Date().toISOString(),
            serverTime: Date.now(),
          },
        });
        console.log('[Broadcast] Heartbeat sent');
      } catch (error) {
        console.error('[Broadcast] Heartbeat failed:', error);
        isConnected = false;
        handleReconnect();
      }
    }
  }, HEARTBEAT_INTERVAL_MS);
}

/**
 * Stop heartbeat
 */
function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

/**
 * Broadcast yield update to all subscribers
 */
export async function broadcastYieldUpdate(data: {
  assets: AssetYieldData[];
  timestamp: string;
  trigger: string; // What triggered this update (event name or "manual")
}): Promise<void> {
  if (!yieldsChannel) {
    console.warn("[Broadcast] Channel not initialized");
    return;
  }
  
  try {
    await yieldsChannel.send({
      type: "broadcast",
      event: "update",
      payload: {
        type: "full_update",
        assetCount: data.assets.length,
        timestamp: data.timestamp,
        trigger: data.trigger,
        assets: data.assets.map((a) => ({
          symbol: a.symbol,
          category: a.category,
          supplyAPY: parseFloat(a.supplyAPY.toFixed(4)),
          borrowAPY: parseFloat(a.borrowAPY.toFixed(4)),
          utilizationRate: parseFloat(a.utilizationRate.toFixed(2)),
        })),
      },
    });
    
    console.log(`[Broadcast] Sent update: ${data.assets.length} assets, trigger: ${data.trigger}`);
  } catch (error) {
    console.error("[Broadcast] Failed to send:", error);
  }
}

/**
 * Broadcast single asset update
 */
export async function broadcastAssetUpdate(asset: AssetYieldData, trigger: string): Promise<void> {
  if (!yieldsChannel) {
    console.warn("[Broadcast] Channel not initialized");
    return;
  }
  
  try {
    await yieldsChannel.send({
      type: "broadcast",
      event: "asset_update",
      payload: {
        type: "single_update",
        timestamp: new Date().toISOString(),
        trigger,
        asset: {
          symbol: asset.symbol,
          category: asset.category,
          supplyAPY: parseFloat(asset.supplyAPY.toFixed(4)),
          borrowAPY: parseFloat(asset.borrowAPY.toFixed(4)),
          utilizationRate: parseFloat(asset.utilizationRate.toFixed(2)),
        },
      },
    });
    
    console.log(`[Broadcast] Sent asset update: ${asset.symbol}`);
  } catch (error) {
    console.error("[Broadcast] Failed to send asset update:", error);
  }
}

/**
 * Broadcast connection status change
 */
async function broadcastConnectionStatus(
  status: 'connected' | 'disconnected' | 'reconnecting'
): Promise<void> {
  if (!yieldsChannel) return;

  try {
    await yieldsChannel.send({
      type: 'broadcast',
      event: 'connection_status',
      payload: {
        status,
        timestamp: new Date().toISOString(),
        reconnectAttempts,
      },
    });
  } catch (error) {
    console.error('[Broadcast] Failed to send connection status:', error);
  }
}

/**
 * Broadcast "best yield changed" event
 */
export async function broadcastBestYieldChanged(data: {
  category: string;
  oldBest: { symbol: string; apy: number } | null;
  newBest: { symbol: string; apy: number };
}): Promise<void> {
  if (!yieldsChannel || !isConnected) return;

  try {
    await yieldsChannel.send({
      type: 'broadcast',
      event: 'best_yield_changed',
      payload: {
        timestamp: new Date().toISOString(),
        category: data.category,
        oldBest: data.oldBest,
        newBest: data.newBest,
        change: data.oldBest
          ? ((data.newBest.apy - data.oldBest.apy) / data.oldBest.apy) * 100
          : null,
      },
    });

    console.log(
      `[Broadcast] Best yield changed: ${data.category} - ${data.newBest.symbol} (${data.newBest.apy}%)`
    );
  } catch (error) {
    console.error('[Broadcast] Failed to send best yield change:', error);
  }
}

/**
 * Broadcast market snapshot
 */
export async function broadcastMarketSnapshot(data: {
  totalAssets: number;
  avgSupplyAPY: number;
  avgBorrowAPY: number;
  highestAPY: { symbol: string; apy: number };
}): Promise<void> {
  if (!yieldsChannel || !isConnected) return;

  try {
    await yieldsChannel.send({
      type: 'broadcast',
      event: 'market_snapshot',
      payload: {
        timestamp: new Date().toISOString(),
        ...data,
      },
    });

    console.log(
      `[Broadcast] Market snapshot sent: ${data.totalAssets} assets, avg ${data.avgSupplyAPY.toFixed(2)}%`
    );
  } catch (error) {
    console.error('[Broadcast] Failed to send market snapshot:', error);
  }
}

/**
 * Cleanup channel on shutdown
 */
export async function closeBroadcastChannel(): Promise<void> {
  stopHeartbeat();

  if (yieldsChannel) {
    await broadcastConnectionStatus('disconnected');
    await yieldsChannel.unsubscribe();
    yieldsChannel = null;
    isConnected = false;
    console.log('[Broadcast] Channel closed');
  }
}
