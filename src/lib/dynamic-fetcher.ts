/**
 * Dynamic Aave V3 Asset Fetcher
 * 
 * Fetches ALL assets from Aave V3 Ethereum directly from contracts.
 * No hardcoded token lists - true DeFi Llama competitor approach.
 * 
 * Flow:
 * 1. Call PoolDataProvider.getAllReservesTokens() → Get all asset addresses
 * 2. For each asset, call getReserveData() → Get APY data
 * 3. Categorize by type (Stablecoin, LST, Governance, etc.)
 */

import { getContract, readContract } from "thirdweb";
import { ethereum } from "thirdweb/chains";
import { thirdwebClient } from "./thirdweb";
import { AAVE_V3_POOL_DATA_PROVIDER } from "./constants";

// Complete ABI for PoolDataProvider
const POOL_DATA_PROVIDER_ABI = [
  // Get all reserve tokens
  {
    inputs: [],
    name: "getAllReservesTokens",
    outputs: [
      {
        components: [
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "address", name: "tokenAddress", type: "address" },
        ],
        internalType: "struct IPoolDataProvider.TokenData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Get reserve configuration
  {
    inputs: [{ internalType: "address", name: "asset", type: "address" }],
    name: "getReserveConfigurationData",
    outputs: [
      { internalType: "uint256", name: "decimals", type: "uint256" },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "liquidationThreshold", type: "uint256" },
      { internalType: "uint256", name: "liquidationBonus", type: "uint256" },
      { internalType: "uint256", name: "reserveFactor", type: "uint256" },
      { internalType: "bool", name: "usageAsCollateralEnabled", type: "bool" },
      { internalType: "bool", name: "borrowingEnabled", type: "bool" },
      { internalType: "bool", name: "stableBorrowRateEnabled", type: "bool" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "bool", name: "isFrozen", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Get reserve data (APY, liquidity, etc.)
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

// RAY = 10^27 (Aave precision)
const RAY = BigInt("1000000000000000000000000000");

// Convert Ray to APY percentage
function rayToAPY(rayRate: bigint): number {
  const rate = Number(rayRate) / Number(RAY);
  return rate * 100;
}

// Asset categories based on symbol
type AssetCategory = "Stablecoin" | "ETH & LST" | "BTC" | "Governance" | "Other";

function categorizeAsset(symbol: string): AssetCategory {
  const stablecoins = ["USDC", "USDT", "DAI", "FRAX", "LUSD", "USDP", "USDe", "crvUSD", "GHO", "PYUSD"];
  const ethLst = ["WETH", "wstETH", "rETH", "cbETH", "swETH", "weETH", "sfrxETH", "osETH", "ETHx"];
  const btc = ["WBTC", "tBTC", "cbBTC"];
  const governance = ["LINK", "AAVE", "MKR", "UNI", "SNX", "CRV", "BAL", "1INCH", "ENS", "LDO", "RPL", "FXS"];

  if (stablecoins.includes(symbol)) return "Stablecoin";
  if (ethLst.includes(symbol)) return "ETH & LST";
  if (btc.includes(symbol)) return "BTC";
  if (governance.includes(symbol)) return "Governance";
  return "Other";
}

// Get icon for asset
function getAssetIcon(symbol: string): string {
  const icons: Record<string, string> = {
    // Stablecoins
    USDC: "💵", USDT: "💲", DAI: "🔶", FRAX: "⚡", LUSD: "🔷",
    USDP: "💎", USDe: "🔷", crvUSD: "🌀", GHO: "👻", PYUSD: "🅿️",
    // ETH & LSTs
    WETH: "💎", wstETH: "🔵", rETH: "🚀", cbETH: "🔷", weETH: "🌊",
    swETH: "🌊", sfrxETH: "❄️", osETH: "🟢", ETHx: "⚡",
    // BTC
    WBTC: "🟠", tBTC: "🔶", cbBTC: "🟡",
    // Governance
    LINK: "🔗", AAVE: "👻", MKR: "🏛️", UNI: "🦄", SNX: "🟣",
    CRV: "🌀", BAL: "⚖️", "1INCH": "🐴", ENS: "🏷️", LDO: "🔴",
    RPL: "🚀", FXS: "❄️",
  };
  return icons[symbol] || "💰";
}

export interface TokenInfo {
  symbol: string;
  address: string;
  category: AssetCategory;
  icon: string;
}

export interface AssetYieldData {
  symbol: string;
  address: string;
  category: AssetCategory;
  icon: string;
  supplyAPY: number;
  borrowAPY: number;
  totalSupply: string;
  totalBorrow: string;
  utilizationRate: number;
  lastUpdated: number;
  isActive: boolean;
  borrowingEnabled: boolean;
}

/**
 * Fetch all reserve tokens from Aave V3 PoolDataProvider
 * Returns dynamic list - no hardcoding!
 */
export async function fetchAllReserveTokens(): Promise<TokenInfo[]> {
  const contract = getContract({
    client: thirdwebClient,
    chain: ethereum,
    address: AAVE_V3_POOL_DATA_PROVIDER,
    abi: POOL_DATA_PROVIDER_ABI,
  });

  const tokens = await readContract({
    contract,
    method: "getAllReservesTokens",
    params: [],
  });

  return tokens.map((token) => ({
    symbol: token.symbol,
    address: token.tokenAddress,
    category: categorizeAsset(token.symbol),
    icon: getAssetIcon(token.symbol),
  }));
}

/**
 * Fetch yield data for a single asset
 */
export async function fetchAssetYieldData(token: TokenInfo): Promise<AssetYieldData> {
  const contract = getContract({
    client: thirdwebClient,
    chain: ethereum,
    address: AAVE_V3_POOL_DATA_PROVIDER,
    abi: POOL_DATA_PROVIDER_ABI,
  });

  // Fetch reserve data and config in parallel
  const [reserveData, configData] = await Promise.all([
    readContract({
      contract,
      method: "getReserveData",
      params: [token.address as `0x${string}`],
    }),
    readContract({
      contract,
      method: "getReserveConfigurationData",
      params: [token.address as `0x${string}`],
    }),
  ]);

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
  ] = reserveData;

  const [
    , // decimals
    , // ltv
    , // liquidationThreshold
    , // liquidationBonus
    , // reserveFactor
    , // usageAsCollateralEnabled
    borrowingEnabled,
    , // stableBorrowRateEnabled
    isActive,
    , // isFrozen
  ] = configData;

  // Calculate utilization rate
  const totalSupplyNum = Number(totalAToken);
  const totalBorrowNum = Number(totalVariableDebt);
  const utilizationRate = totalSupplyNum > 0 
    ? (totalBorrowNum / totalSupplyNum) * 100 
    : 0;

  return {
    symbol: token.symbol,
    address: token.address,
    category: token.category,
    icon: token.icon,
    supplyAPY: rayToAPY(liquidityRate),
    borrowAPY: rayToAPY(variableBorrowRate),
    totalSupply: totalAToken.toString(),
    totalBorrow: totalVariableDebt.toString(),
    utilizationRate,
    lastUpdated: Number(lastUpdateTimestamp),
    isActive,
    borrowingEnabled,
  };
}

/**
 * Fetch ALL Aave V3 assets with yield data
 * Dynamic - fetches token list from contract first
 */
export async function fetchAllAssetsYieldData(): Promise<AssetYieldData[]> {
  console.log("[DynamicFetcher] Fetching all reserve tokens...");
  
  // Step 1: Get all token addresses from contract
  const tokens = await fetchAllReserveTokens();
  console.log(`[DynamicFetcher] Found ${tokens.length} assets`);
  
  // Step 2: Fetch yield data for each token in parallel
  const yields = await Promise.all(
    tokens.map((token) => fetchAssetYieldData(token))
  );
  
  // Step 3: Filter out inactive assets and sort by supply APY
  const activeYields = yields
    .filter((y) => y.isActive)
    .sort((a, b) => b.supplyAPY - a.supplyAPY);
  
  console.log(`[DynamicFetcher] Fetched ${activeYields.length} active assets`);
  
  return activeYields;
}

/**
 * Get asset addresses for event filtering
 */
export async function getTrackedAssetAddresses(): Promise<string[]> {
  const tokens = await fetchAllReserveTokens();
  return tokens.map((t) => t.address.toLowerCase());
}
