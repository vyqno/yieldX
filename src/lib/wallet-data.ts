/**
 * Wallet Data Fetching
 *
 * Fetches user's wallet balances and Aave positions
 */

import { getContract } from 'thirdweb';
import { thirdwebClient } from './thirdweb';
import { getChainConfig, type SupportedChainId } from './chains-config';
import { balanceOf } from 'thirdweb/extensions/erc20';

export interface WalletBalance {
  symbol: string;
  balance: string;
  balanceUSD?: number;
}

export interface AavePosition {
  symbol: string;
  deposited: string;
  aTokenBalance: string;
  currentValue: string;
  earnedInterest: string;
}

/**
 * Get ERC20 token balance for a wallet
 */
export async function getTokenBalance(
  walletAddress: string,
  tokenAddress: string,
  chainId: SupportedChainId = 'mainnet'
): Promise<bigint> {
  try {
    const config = getChainConfig(chainId);
    const contract = getContract({
      client: thirdwebClient,
      address: tokenAddress,
      chain: config.chain,
    });

    const balance = await balanceOf({ contract, address: walletAddress });
    return balance;
  } catch (error) {
    console.error(`Failed to fetch balance for ${tokenAddress}:`, error);
    return BigInt(0);
  }
}

/**
 * Get all token balances for supported assets
 */
export async function getWalletBalances(
  walletAddress: string,
  chainId: SupportedChainId = 'mainnet'
): Promise<WalletBalance[]> {
  const config = getChainConfig(chainId);
  const balances: WalletBalance[] = [];

  for (const [symbol, address] of Object.entries(config.tokens)) {
    try {
      const balance = await getTokenBalance(walletAddress, address, chainId);
      const decimals = symbol === 'USDC' || symbol === 'USDT' ? 6 : 18;
      const formattedBalance = Number(balance) / Math.pow(10, decimals);

      balances.push({
        symbol,
        balance: formattedBalance.toFixed(6),
      });
    } catch (error) {
      console.error(`Failed to fetch ${symbol} balance:`, error);
    }
  }

  return balances;
}

/**
 * Get user's Aave positions (aToken balances)
 */
export async function getAavePositions(
  walletAddress: string,
  chainId: SupportedChainId = 'mainnet'
): Promise<AavePosition[]> {
  const config = getChainConfig(chainId);
  const positions: AavePosition[] = [];

  for (const [symbol, aTokenAddress] of Object.entries(config.aTokens)) {
    try {
      const aTokenBalance = await getTokenBalance(walletAddress, aTokenAddress, chainId);
      const decimals = symbol === 'USDC' || symbol === 'USDT' ? 6 : 18;
      const formattedBalance = Number(aTokenBalance) / Math.pow(10, decimals);

      if (formattedBalance > 0) {
        positions.push({
          symbol,
          deposited: formattedBalance.toFixed(6),
          aTokenBalance: formattedBalance.toFixed(6),
          currentValue: formattedBalance.toFixed(6), // aTokens increase in value over time
          earnedInterest: '0.00', // Would need historical data to calculate
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${symbol} aToken balance:`, error);
    }
  }

  return positions;
}

/**
 * Get complete wallet summary for AI context
 */
export async function getWalletSummary(
  walletAddress: string,
  chainId: SupportedChainId = 'mainnet'
): Promise<string> {
  const [balances, positions] = await Promise.all([
    getWalletBalances(walletAddress, chainId),
    getAavePositions(walletAddress, chainId),
  ]);

  let summary = `User Wallet: ${walletAddress}\n`;
  summary += `Network: ${chainId}\n\n`;

  summary += `Token Balances:\n`;
  balances.forEach(b => {
    summary += `- ${b.symbol}: ${b.balance}\n`;
  });

  if (positions.length > 0) {
    summary += `\nAave Positions:\n`;
    positions.forEach(p => {
      summary += `- ${p.symbol}: ${p.deposited} deposited (earning interest)\n`;
    });
  } else {
    summary += `\nNo active Aave positions yet.\n`;
  }

  return summary;
}
