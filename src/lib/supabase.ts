/**
 * Supabase Client
 *
 * For storing daily APY snapshots and historical data.
 */

import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

// Public client (for read operations)
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

// Service client (for write operations - use in API routes only)
// Note: Service role key is optional and only needed for server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey
  ? createClient(ENV.SUPABASE_URL, supabaseServiceKey)
  : null;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
}

// Types for database
export interface DbProject {
  id: string;
  name: string;
  slug: string;
  chain_id: number;
  chain_name: string;
  pool_address: string;
  data_provider_address: string | null;
}

export interface DbAsset {
  id: string;
  project_id: string;
  symbol: string;
  address: string;
  category: string;
  decimals: number;
}

export interface DbDailySnapshot {
  id: string;
  asset_id: string;
  snapshot_date: string;
  supply_apy: number;
  borrow_apy: number | null;
  utilization_rate: number | null;
  total_supply_raw: string | null;
  total_borrow_raw: string | null;
  tvl_usd: number | null;
}
