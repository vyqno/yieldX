/**
 * Worker Control API
 * 
 * Endpoint: POST /api/worker/start
 * 
 * Starts the background yield worker.
 * Should be called once on server startup.
 * 
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 */

import { NextResponse } from "next/server";
import { startYieldWorker, getWorkerStatus, manualRefresh } from "@/lib/yield-worker";

// Verify secret
function verifySecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow in development without auth
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  
  if (!cronSecret) {
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function POST(request: Request) {
  if (!verifySecret(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json().catch(() => ({}));
    const action = (body as { action?: string }).action || "start";
    
    if (action === "start") {
      await startYieldWorker();
      return NextResponse.json({
        success: true,
        message: "Worker started",
        status: getWorkerStatus(),
        timestamp: new Date().toISOString(),
      });
    } else if (action === "refresh") {
      await manualRefresh();
      return NextResponse.json({
        success: true,
        message: "Manual refresh triggered",
        status: getWorkerStatus(),
        timestamp: new Date().toISOString(),
      });
    } else if (action === "status") {
      return NextResponse.json({
        success: true,
        status: getWorkerStatus(),
        timestamp: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Worker API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to control worker",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Status check doesn't need auth
  return NextResponse.json({
    success: true,
    status: getWorkerStatus(),
    timestamp: new Date().toISOString(),
  });
}
