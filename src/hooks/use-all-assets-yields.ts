"use client";

/**
 * useAllAssetsYields Hook
 * 
 * Fetches ALL Aave V3 assets dynamically from contract.
 * Event-driven updates - only refetches when on-chain state changes.
 * 
 * This is the DeFi Llama competitor approach.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  fetchAllAssetsYieldData, 
  getTrackedAssetAddresses,
  type AssetYieldData 
} from "@/lib/dynamic-fetcher";
import { listenToAaveEvents, type AaveEvent } from "@/lib/event-listener";

interface UseAllAssetsYieldsReturn {
  data: AssetYieldData[];
  loading: boolean;
  error: Error | null;
  lastFetched: Date | null;
  lastEvent: AaveEvent | null;
  eventCount: number;
  assetCount: number;
  refetch: () => Promise<void>;
}

export function useAllAssetsYields(): UseAllAssetsYieldsReturn {
  const [data, setData] = useState<AssetYieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [lastEvent, setLastEvent] = useState<AaveEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [trackedAddresses, setTrackedAddresses] = useState<string[]>([]);
  
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("[useAllAssetsYields] Fetching all assets...");
      const yields = await fetchAllAssetsYieldData();
      
      setData(yields);
      setLastFetched(new Date());
      
      // Update tracked addresses for event filtering
      const addresses = yields.map((y) => y.address.toLowerCase());
      setTrackedAddresses(addresses);
      
      console.log(`[useAllAssetsYields] Fetched ${yields.length} assets`);
    } catch (err) {
      console.error("[useAllAssetsYields] Failed to fetch:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch yields"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch
  const debouncedFetch = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchData();
    }, 500);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up event listener
  useEffect(() => {
    const handleEvent = (event: AaveEvent) => {
      // Check if event is for a tracked asset
      if (trackedAddresses.length > 0 && 
          !trackedAddresses.includes(event.reserve.toLowerCase())) {
        return; // Ignore events for assets we're not tracking
      }
      
      console.log(`[useAllAssetsYields] Event: ${event.eventName} for ${event.reserve}`);
      setLastEvent(event);
      setEventCount((prev) => prev + 1);
      
      // Debounced refetch
      debouncedFetch();
    };

    const unsubscribe = listenToAaveEvents(handleEvent);

    return () => {
      unsubscribe();
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [debouncedFetch, trackedAddresses]);

  return {
    data,
    loading,
    error,
    lastFetched,
    lastEvent,
    eventCount,
    assetCount: data.length,
    refetch: fetchData,
  };
}
