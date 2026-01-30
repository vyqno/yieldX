/**
 * Multi-Chain Configuration
 *
 * Supports Ethereum Mainnet, Sepolia Testnet, Base Mainnet, and Base Sepolia
 */

import { ethereum, sepolia, base, baseSepolia } from 'thirdweb/chains';

export const SUPPORTED_CHAINS = {
  mainnet: ethereum,
  sepolia: sepolia,
  base: base,
  baseSepolia: baseSepolia,
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

/**
 * Aave V3 Pool Addresses
 */
export const AAVE_V3_POOL_ADDRESSES = {
  mainnet: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  sepolia: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
  base: '0xA238Dd80C259a72e81D9bEbA8ba1090720d54D0',
  baseSepolia: '0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27',
} as const;

/**
 * Token Addresses per Chain
 */
export const TOKEN_ADDRESSES = {
  mainnet: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  sepolia: {
    USDC: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', // Official Aave V3 Sepolia
    USDT: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', // Official Aave V3 Sepolia
    DAI: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',  // Official Aave V3 Sepolia
    WETH: '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c', // Official Aave V3 Sepolia
  },
  base: {
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Native USDC on Base
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', // Base USDT
    WETH: '0x4200000000000000000000000000000000000006', // Base WETH
  },
  baseSepolia: {
    USDC: '0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f', // Base Sepolia USDC
    USDT: '0x0a215D8ba66387DCA84B284D18c3B4ec3de6E54a', // Base Sepolia USDT
    WETH: '0x4200000000000000000000000000000000000006', // Base Sepolia WETH
  },
} as const;

/**
 * aToken Addresses (receipt tokens that earn interest)
 */
export const ATOKEN_ADDRESSES = {
  mainnet: {
    USDC: '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // aEthUSDC
    USDT: '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', // aEthUSDT
    DAI: '0x018008bfb33d285247A21d44E50697654f754e63',  // aEthDAI
    WETH: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', // aEthWETH
  },
  sepolia: {
    USDC: '0x16dA4541aD1807f4443d92D26044C1147406EB80', // aUSDC (Aave V3 Sepolia)
    USDT: '0xAF0F6e8b0Dc5c913bbF4d14c22B4E78Dd14310B6', // aUSDT (Aave V3 Sepolia)
    DAI: '0x29598b72eb5CeBd806C5dCD549490FdA35B13cD8',  // aDAI (Aave V3 Sepolia)
    WETH: '0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830', // aWETH (Aave V3 Sepolia)
  },
  base: {
    USDC: '0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB', // aBasUSDC (Base Mainnet)
    USDT: '0x0a1d576f3eFeF75b330424287a95A366e8281D54', // aBasUSDT (Base Mainnet)
    WETH: '0xD4a0e0b9149BCee3C920d2E00b5dE09138fd8bb7', // aBasWETH (Base Mainnet)
  },
  baseSepolia: {
    USDC: '0x10F1A9D11CDf50041f3f8cB7191CBE2f31750ACC', // aBasSepoliaUSDC
    USDT: '0xcE3CAae5Ed17A7AafCEEbc897DE843fA6CC0c018', // aBasSepoliaUSDT
    WETH: '0x73a5bB60b0B0fc35710DDc0ea9c407031E31Bdbb', // aBasSepoliaWETH
  },
} as const;

/**
 * Get chain-specific configuration
 */
export function getChainConfig(chainId: SupportedChainId) {
  return {
    chain: SUPPORTED_CHAINS[chainId],
    aavePool: AAVE_V3_POOL_ADDRESSES[chainId],
    tokens: TOKEN_ADDRESSES[chainId],
    aTokens: ATOKEN_ADDRESSES[chainId],
  };
}

/**
 * Chain display names
 */
export const CHAIN_NAMES = {
  mainnet: 'Ethereum Mainnet',
  sepolia: 'Sepolia Testnet',
  base: 'Base Mainnet',
  baseSepolia: 'Base Sepolia Testnet',
} as const;

/**
 * Chain warnings
 */
export const CHAIN_WARNINGS = {
  mainnet: '⚠️ REAL MONEY - High gas fees (~$5)',
  sepolia: '✅ Test Network - Free tokens, may be at capacity',
  base: '💰 REAL MONEY - Low gas fees (~$0.10)',
  baseSepolia: '✅ Test Network - Free tokens, may be at capacity',
} as const;

/**
 * Faucet links for test tokens
 */
export const FAUCET_LINKS = {
  sepolia: {
    eth: 'https://www.alchemy.com/faucets/ethereum-sepolia',
    aave: 'https://staging.aave.com/faucet/',
  },
  baseSepolia: {
    eth: 'https://www.alchemy.com/faucets/base-sepolia',
    aave: 'https://staging.aave.com/faucet/',
  },
} as const;
