/**
 * Aave V3 Deposit Functionality
 *
 * Core functions to deposit and withdraw from Aave pools
 */

import { prepareContractCall, getContract, type ThirdwebClient } from 'thirdweb';
import type { Chain } from 'thirdweb/chains';
import { getChainConfig, type SupportedChainId, TOKEN_ADDRESSES } from './chains-config';

// Export for backward compatibility
export { TOKEN_ADDRESSES };

/**
 * Prepare ERC20 approval transaction
 */
export function prepareApproveTransaction(
  client: ThirdwebClient,
  tokenAddress: string,
  amount: bigint,
  chainId: SupportedChainId = 'mainnet'
) {
  const config = getChainConfig(chainId);
  const tokenContract = getContract({
    client,
    address: tokenAddress,
    chain: config.chain,
  });

  return prepareContractCall({
    contract: tokenContract,
    method: 'function approve(address spender, uint256 amount) returns (bool)',
    params: [config.aavePool, amount],
  });
}

/**
 * Prepare Aave supply (deposit) transaction
 */
export function prepareSupplyTransaction(
  client: ThirdwebClient,
  tokenAddress: string,
  amount: bigint,
  userAddress: string,
  chainId: SupportedChainId = 'mainnet'
) {
  const config = getChainConfig(chainId);
  const aaveContract = getContract({
    client,
    address: config.aavePool,
    chain: config.chain,
  });

  return prepareContractCall({
    contract: aaveContract,
    method: 'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
    params: [tokenAddress, amount, userAddress, 0], // referralCode = 0
  });
}

/**
 * Prepare Aave withdraw transaction
 */
export function prepareWithdrawTransaction(
  client: ThirdwebClient,
  tokenAddress: string,
  amount: bigint,
  userAddress: string,
  chainId: SupportedChainId = 'mainnet'
) {
  const config = getChainConfig(chainId);
  const aaveContract = getContract({
    client,
    address: config.aavePool,
    chain: config.chain,
  });

  // Use max uint256 to withdraw all
  const withdrawAmount = amount === BigInt(0)
    ? BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
    : amount;

  return prepareContractCall({
    contract: aaveContract,
    method: 'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
    params: [tokenAddress, withdrawAmount, userAddress],
  });
}

/**
 * Get user's aToken balance (proof of deposit)
 * aTokens are receipt tokens that accrue interest
 */
export function getATokenContract(
  client: ThirdwebClient,
  aTokenAddress: string,
  chainId: SupportedChainId = 'mainnet'
) {
  const config = getChainConfig(chainId);
  return getContract({
    client,
    address: aTokenAddress,
    chain: config.chain,
  });
}

/**
 * Helper to convert token amount to proper decimals
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

/**
 * Helper to format token amount from wei
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const str = amount.toString().padStart(decimals + 1, '0');
  const whole = str.slice(0, -decimals) || '0';
  const fraction = str.slice(-decimals).replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole;
}
