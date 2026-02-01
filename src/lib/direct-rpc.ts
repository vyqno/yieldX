/**
 * Direct RPC Yield Fetcher
 * 
 * This module fetches Aave V3 reserve data DIRECTLY from the blockchain
 * via Thirdweb SDK, bypassing any GraphQL indexing delays.
 * 
 * Latency: ~100-500ms per call (real-time, every block)
 * vs GraphQL API: ~30-60 second indexing delay
 */

import { getContract, readContract } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { thirdwebClient } from "./thirdweb";
import { AAVE_V3_POOL_DATA_PROVIDER, TOKENS } from "./constants";

// Aave V3 PoolDataProvider ABI (only the function we need)
const POOL_DATA_PROVIDER_ABI = [
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveData",
    outputs: [
      { internalType: "uint256", name: "unbacked", type: "uint256" },
      { internalType: "uint256", name: "accruedToTreasuryScaled", type: "uint256" },
      { internalType: "uint256", name: "totalAToken", type: "uint256" },
      { internalType: "uint256", name: "totalStableDebt", type: "uint256" },
      { internalType: "uint256", name: "totalVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "liquidityRate", type: "uint256" },
      { internalType: "uint256", name: "variableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "averageStableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "liquidityIndex", type: "uint256" },
      { internalType: "uint256", name: "variableBorrowIndex", type: "uint256" },
      { internalType: "uint256", name: "lastUpdateTimestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// RAY = 10^27 (Aave uses Ray for precision)
const RAY = BigInt("1000000000000000000000000000"); // 10^27

// Convert Aave's Ray rate to APY percentage
// NOTE: liquidityRate and variableBorrowRate from Aave are ALREADY annual rates in Ray format
// We just need to convert from Ray to decimal, then to percentage
function rayToAPY(rayRate: bigint): number {
  // Convert from Ray (27 decimals) to decimal
  const rate = Number(rayRate) / Number(RAY);
  // Convert to percentage (multiply by 100)
  return rate * 100;
}

export interface ReserveYieldData {
  asset: string;
  symbol: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: string;
  totalBorrow: string;
  lastUpdated: number;
  fetchedAt: Date;
}

/**
 * Fetch real-time reserve data directly from Aave V3 contracts
 * This bypasses GraphQL indexing delays for true low-latency data
 */
export async function fetchReserveDataDirect(
  assetAddress: string,
  assetSymbol: string
): Promise<ReserveYieldData> {
  const contract = getContract({
    client: thirdwebClient,
    chain: ethereum,
    address: AAVE_V3_POOL_DATA_PROVIDER,
    abi: POOL_DATA_PROVIDER_ABI,
  });

  const data = await readContract({
    contract,
    method: "getReserveData",
    params: [assetAddress as `0x${string}`],
  });

  // Parse the response
  const [
    , // unbacked
    , // accruedToTreasuryScaled
    totalAToken,
    , // totalStableDebt
    totalVariableDebt,
    liquidityRate,
    variableBorrowRate,
    , // stableBorrowRate
    , // averageStableBorrowRate
    , // liquidityIndex
    , // variableBorrowIndex
    lastUpdateTimestamp,
  ] = data;

  return {
    asset: assetAddress,
    symbol: assetSymbol,
    supplyAPY: rayToAPY(liquidityRate),
    borrowAPY: rayToAPY(variableBorrowRate),
    totalSupply: totalAToken.toString(),
    totalBorrow: totalVariableDebt.toString(),
    lastUpdated: Number(lastUpdateTimestamp),
    fetchedAt: new Date(),
  };
}

/**
 * Fetch all tracked stablecoins in parallel
 * Returns data in ~500ms (vs 30-60s for GraphQL)
 */
export async function fetchAllYieldsDirect(): Promise<ReserveYieldData[]> {
  const promises = Object.values(TOKENS).map((token) =>
    fetchReserveDataDirect(token.address, token.symbol)
  );

  return Promise.all(promises);
}

/**
 * Find the best supply APY among all tracked assets
 */
export async function findBestYieldDirect(): Promise<ReserveYieldData | null> {
  const yields = await fetchAllYieldsDirect();
  
  if (yields.length === 0) return null;
  
  return yields.reduce((best, current) =>
    current.supplyAPY > best.supplyAPY ? current : best
  );
}
