// Asset and Protocol Constants for YieldX
// All addresses are for Ethereum Mainnet (Chain ID: 1)

// ============================================
// AAVE V3 PROTOCOL ADDRESSES
// ============================================
export const AAVE_V3_POOL_ADDRESS = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
export const AAVE_V3_POOL_DATA_PROVIDER = "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3";

// ============================================
// STABLECOIN TOKEN ADDRESSES (Underlying)
// ============================================
export const TOKENS = {
  USDC: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    icon: "💵",
    type: "Fiat-Backed",
  },
  USDT: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    icon: "💲",
    type: "Fiat-Backed",
  },
  USDe: {
    address: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
    symbol: "USDe",
    name: "Ethena USDe",
    decimals: 18,
    icon: "🔷",
    type: "Synthetic",
  },
  crvUSD: {
    address: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
    symbol: "crvUSD",
    name: "Curve USD",
    decimals: 18,
    icon: "🌀",
    type: "DeFi-Native",
  },
} as const;

// ============================================
// AAVE aToken ADDRESSES (Yield-Bearing)
// ============================================
export const AAVE_ATOKENS = {
  aEthUSDC: "0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c",
  aEthUSDT: "0x71fc860F7D3A592A4a98740e39dB31d25db65ae8",
  aEthUSDe: "0x4f5923Fc79a124c47b01D3643012dECf5429aD89",
  aEthcrvUSD: "0xb82fa9f31612989525992FCfBB09AB22Eff5c85a",
} as const;

// Token list as array for iteration
export const TOKEN_LIST = Object.values(TOKENS);

// Alias for API compatibility
export const TRACKED_ASSETS = TOKEN_LIST;

// Chain configuration
export const ETHEREUM_CHAIN_ID = 1;
