/**
 * Daily Cron API: Store APY Snapshots
 * 
 * Endpoint: POST /api/cron/daily-snapshot
 * 
 * This should be called once per day (e.g., via Vercel Cron or GitHub Actions)
 * to store end-of-day APY snapshots for historical data.
 * 
 * Headers required:
 *   Authorization: Bearer <CRON_SECRET>
 */

import { NextResponse } from "next/server";
import { fetchAllAssetsYieldData, fetchAllReserveTokens } from "@/lib/dynamic-fetcher";
import { supabaseAdmin } from "@/lib/supabase";

// Verify cron secret
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn("[Cron] CRON_SECRET not configured");
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: Request) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Check Supabase is configured
  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, error: "Supabase not configured" },
      { status: 500 }
    );
  }
  
  try {
    const startTime = Date.now();
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    console.log(`[Cron] Starting daily snapshot for ${today}`);
    
    // Get or create project
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("slug", "aave-v3-ethereum")
      .single();
    
    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: "Project not found. Run schema.sql first." },
        { status: 500 }
      );
    }
    
    // Fetch all tokens and yields
    const tokens = await fetchAllReserveTokens();
    const yields = await fetchAllAssetsYieldData();
    
    let insertedCount = 0;
    let errorCount = 0;
    
    for (const yieldData of yields) {
      try {
        // Upsert asset
        const { data: asset, error: assetError } = await supabaseAdmin
          .from("assets")
          .upsert({
            project_id: project.id,
            symbol: yieldData.symbol,
            address: yieldData.address,
            category: yieldData.category,
          }, {
            onConflict: "project_id,address",
          })
          .select("id")
          .single();
        
        if (assetError || !asset) {
          console.error(`[Cron] Failed to upsert asset ${yieldData.symbol}:`, assetError);
          errorCount++;
          continue;
        }
        
        // Insert daily snapshot
        const { error: snapshotError } = await supabaseAdmin
          .from("daily_snapshots")
          .upsert({
            asset_id: asset.id,
            snapshot_date: today,
            supply_apy: yieldData.supplyAPY,
            borrow_apy: yieldData.borrowingEnabled ? yieldData.borrowAPY : null,
            utilization_rate: yieldData.utilizationRate,
            total_supply_raw: yieldData.totalSupply,
            total_borrow_raw: yieldData.totalBorrow,
          }, {
            onConflict: "asset_id,snapshot_date",
          });
        
        if (snapshotError) {
          console.error(`[Cron] Failed to insert snapshot for ${yieldData.symbol}:`, snapshotError);
          errorCount++;
        } else {
          insertedCount++;
        }
      } catch (err) {
        console.error(`[Cron] Error processing ${yieldData.symbol}:`, err);
        errorCount++;
      }
    }
    
    const latencyMs = Date.now() - startTime;
    
    console.log(`[Cron] Completed: ${insertedCount} snapshots, ${errorCount} errors, ${latencyMs}ms`);
    
    return NextResponse.json({
      success: true,
      date: today,
      totalAssets: yields.length,
      insertedCount,
      errorCount,
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create daily snapshot",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also allow GET for testing (but still require auth)
export async function GET(request: Request) {
  return POST(request);
}
