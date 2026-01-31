import { createThirdwebAI } from '@thirdweb-dev/ai-sdk-provider';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getYieldData } from '@/lib/yield-service';
import { calculateRiskScore } from '@/lib/risk-score';
import { getWalletSummary, getWalletBalances, getAavePositions } from '@/lib/wallet-data';
import type { SupportedChainId } from '@/lib/chains-config';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize thirdweb AI with secret key
const thirdwebAI = createThirdwebAI({
  secretKey: process.env.THIRDWEB_SECRET_KEY || '',
});

// Tool definitions with proper inputSchema for ai SDK v6
const getYieldDataTool = tool({
  description: 'Get current APY data for all supported assets from Aave V3',
  inputSchema: z.object({
    _trigger: z.string().optional().describe('Dummy parameter - just pass any string'),
  }),
  execute: async () => {
    console.log('🔧 AI Tool Called: getYieldData');
    const data = await getYieldData();
    console.log(`✅ Fetched ${data.length} assets`);
    return {
      assets: data.map((asset) => ({
        symbol: asset.symbol,
        supplyAPY: asset.supplyAPY,
        borrowAPY: asset.borrowAPY,
        category: asset.category,
        totalSupply: asset.totalSupply,
        utilizationRate: asset.utilizationRate,
      })),
    };
  },
});

const analyzeRiskTool = tool({
  description: 'Analyze risk score (0-100) for a specific asset',
  inputSchema: z.object({
    symbol: z.string().describe('Asset symbol like USDC, DAI, WETH'),
  }),
  execute: async ({ symbol }) => {
    const data = await getYieldData();
    const asset = data.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());

    if (!asset) {
      return { error: `Asset ${symbol} not found` };
    }

    const riskAnalysis = calculateRiskScore(asset);
    return {
      symbol: asset.symbol,
      riskScore: riskAnalysis.score,
      riskLevel: riskAnalysis.level,
      supplyAPY: asset.supplyAPY,
      factors: riskAnalysis.factors,
      recommendation: riskAnalysis.recommendation,
    };
  },
});

const compareAssetsTool = tool({
  description: 'Compare multiple assets side by side for yield and risk',
  inputSchema: z.object({
    symbols: z.array(z.string()).describe('Array of asset symbols to compare'),
  }),
  execute: async ({ symbols }) => {
    const data = await getYieldData();
    const comparisons = symbols.map((symbol) => {
      const asset = data.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
      if (!asset) return { symbol, error: 'Not found' };

      const risk = calculateRiskScore(asset);
      return {
        symbol: asset.symbol,
        supplyAPY: asset.supplyAPY,
        riskScore: risk.score,
        riskLevel: risk.level,
        category: asset.category,
      };
    });

    return { comparisons };
  },
});

const recommendPoolTool = tool({
  description: 'Recommend the best pool based on user risk tolerance',
  inputSchema: z.object({
    riskTolerance: z.enum(['low', 'medium', 'high']).describe('User risk tolerance level'),
  }),
  execute: async ({ riskTolerance }) => {
    const data = await getYieldData();
    const analyzed = data.map((asset) => ({
      ...asset,
      risk: calculateRiskScore(asset),
    }));

    // Filter based on risk tolerance
    const filtered = analyzed.filter((a) => {
      if (riskTolerance === 'low') return a.risk.score <= 30;
      if (riskTolerance === 'medium') return a.risk.score > 30 && a.risk.score <= 60;
      return a.risk.score > 60;
    });

    // Sort by APY (highest first)
    const sorted = filtered.sort((a, b) => b.supplyAPY - a.supplyAPY);
    const best = sorted[0];

    if (!best) {
      return {
        error: `No pools found matching ${riskTolerance} risk tolerance`,
      };
    }

    return {
      recommendation: {
        symbol: best.symbol,
        supplyAPY: best.supplyAPY,
        riskScore: best.risk.score,
        riskLevel: best.risk.level,
        category: best.category,
        reason: best.risk.recommendation,
      },
    };
  },
});

const getUserWalletTool = tool({
  description: 'Get user wallet balances and Aave positions',
  inputSchema: z.object({
    walletAddress: z.string().describe('User wallet address (0x...)'),
    chainId: z.enum(['mainnet', 'sepolia', 'base', 'baseSepolia']).optional().describe('Network to check'),
  }),
  execute: async ({ walletAddress, chainId = 'mainnet' }) => {
    const summary = await getWalletSummary(walletAddress, chainId as SupportedChainId);
    return { summary };
  },
});

const getUserBalancesTool = tool({
  description: 'Get user token balances for all supported assets',
  inputSchema: z.object({
    walletAddress: z.string().describe('User wallet address'),
    chainId: z.enum(['mainnet', 'sepolia', 'base', 'baseSepolia']).optional(),
  }),
  execute: async ({ walletAddress, chainId = 'mainnet' }) => {
    const balances = await getWalletBalances(walletAddress, chainId as SupportedChainId);
    return { balances };
  },
});

const getUserPositionsTool = tool({
  description: 'Get user active Aave positions (deposits)',
  inputSchema: z.object({
    walletAddress: z.string().describe('User wallet address'),
    chainId: z.enum(['mainnet', 'sepolia', 'base', 'baseSepolia']).optional(),
  }),
  execute: async ({ walletAddress, chainId = 'mainnet' }) => {
    const positions = await getAavePositions(walletAddress, chainId as SupportedChainId);
    return { positions };
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: thirdwebAI.chat('claude-sonnet'),
    messages,
    system: `You are YieldX AI, an expert DeFi yield advisor for the YieldX platform.

CRITICAL: You have access to REAL-TIME data through tools. ALWAYS use tools to get current information:

TOOLS YOU MUST USE:
1. getYieldData - ALWAYS call this when discussing APY rates, yields, or pools
2. analyzeRisk - ALWAYS call this when discussing specific assets or safety
3. compareAssets - ALWAYS call this when comparing tokens
4. recommendPool - ALWAYS call this when user asks for recommendations
5. getUserWallet - ALWAYS call this when user provides wallet address
6. getUserBalances - Call to check what tokens user has
7. getUserPositions - Call to check user's Aave deposits

INSTRUCTIONS:
- When user asks "What are current APY rates?" → Call getYieldData tool FIRST, then show results
- When user asks "Which is safest?" → Call getYieldData + analyzeRisk tools
- When user asks "Recommend a pool" → Call recommendPool tool
- When user provides wallet address → Call getUserWallet tool immediately
- NEVER guess or make up numbers - ALWAYS use tools for real data

Key Facts:
- Platform supports: Ethereum Mainnet, Base Mainnet, Base Sepolia, Sepolia testnet
- Base Mainnet has ~$0.10 gas fees (cheapest for testing)
- Assets: USDC, USDT, DAI (not on Base Sepolia), WETH
- Users deposit to Aave and receive aTokens that earn interest automatically

Be concise and actionable. Always use tools to get real data before answering.

FORMATTING INSTRUCTIONS:
- Use **Markdown** for all responses.
- Use **Tables** when comparing multiple assets (e.g., | Asset | APY | Risk |).
- Use **Bold** for key numbers (e.g., **4.5% APY**).
- Use Bullet points for lists.
- If a tool fails or you cannot access valid data, do NOT say "I cannot access on-chain data". Instead, say "I am currently unable to retrieve the latest live data due to a network check, but generally..." and provide general advice.`,
    tools: {
      getYieldData: getYieldDataTool,
      analyzeRisk: analyzeRiskTool,
      compareAssets: compareAssetsTool,
      recommendPool: recommendPoolTool,
      getUserWallet: getUserWalletTool,
      getUserBalances: getUserBalancesTool,
      getUserPositions: getUserPositionsTool,
    },
  });

  return result.toTextStreamResponse();
}
