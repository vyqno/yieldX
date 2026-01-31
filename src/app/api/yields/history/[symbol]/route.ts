/**
 * Historical API: Get 30-Day Average APY
 * 
 * Endpoint: GET /api/yields/history/[symbol]
 * 
 * Returns historical APY data from Supabase daily snapshots.
 * Includes 30-day average and daily data points for charts.
 */

import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ symbol: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  
  // Check if Supabase is configured
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json(
      {
        success: false,
        error: "Historical data not available",
        message: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
  
  try {
    // Get asset
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("id, symbol, category, address")
      .eq("symbol", upperSymbol)
      .single();
    
    if (assetError || !asset) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found",
          message: `No historical data for '${symbol}'`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }
    
    // Get last 30 days of snapshots
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: snapshots, error: snapshotError } = await supabase
      .from("daily_snapshots")
      .select("*")
      .eq("asset_id", asset.id)
      .gte("snapshot_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("snapshot_date", { ascending: true });
    
    if (snapshotError) {
      throw snapshotError;
    }
    
    // Calculate averages
    const avgSupplyAPY = snapshots && snapshots.length > 0
      ? snapshots.reduce((sum, s) => sum + (s.supply_apy || 0), 0) / snapshots.length
      : null;
    
    const avgBorrowAPY = snapshots && snapshots.length > 0
      ? snapshots.reduce((sum, s) => sum + (s.borrow_apy || 0), 0) / snapshots.length
      : null;
    
    const avgUtilization = snapshots && snapshots.length > 0
      ? snapshots.reduce((sum, s) => sum + (s.utilization_rate || 0), 0) / snapshots.length
      : null;
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      asset: {
        symbol: asset.symbol,
        address: asset.address,
        category: asset.category,
      },
      period: {
        days: 30,
        dataPoints: snapshots?.length || 0,
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
      },
      averages: {
        supplyAPY: avgSupplyAPY ? parseFloat(avgSupplyAPY.toFixed(4)) : null,
        borrowAPY: avgBorrowAPY ? parseFloat(avgBorrowAPY.toFixed(4)) : null,
        utilizationRate: avgUtilization ? parseFloat(avgUtilization.toFixed(2)) : null,
      },
      history: snapshots?.map((s) => ({
        date: s.snapshot_date,
        supplyAPY: s.supply_apy,
        borrowAPY: s.borrow_apy,
        utilizationRate: s.utilization_rate,
      })) || [],
    };
    
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "X-Data-Source": "supabase",
      },
    });
  } catch (error) {
    console.error("[API /yields/history] Error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch historical data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
