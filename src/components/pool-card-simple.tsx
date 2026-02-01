"use client";

import { useState } from "react";
import { DepositButton } from "./deposit-button";
import { getChainConfig, type SupportedChainId } from "@/lib/chains-config";

interface PoolCardSimpleProps {
  symbol: string;
  category: string;
  supplyAPY: number;
  chainId: SupportedChainId;
  riskScore?: number;
  riskLevel?: string;
}

export function PoolCardSimple({
  symbol,
  category,
  supplyAPY,
  chainId,
  riskScore = 50,
  riskLevel = "medium",
}: PoolCardSimpleProps) {
  const [amount, setAmount] = useState("100");
  const config = getChainConfig(chainId);
  const isSupported = symbol in config.tokens;

  const getRiskColor = () => {
    if (riskScore < 30) return "bg-green-100 text-green-800 border-green-300";
    if (riskScore < 60) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getRiskEmoji = () => {
    if (riskScore < 30) return "🟢";
    if (riskScore < 60) return "🟡";
    return "🔴";
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{category}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[var(--asset-aave)]">{supplyAPY.toFixed(2)}%</div>
          <div className="text-xs text-muted-foreground">APY</div>
        </div>
      </div>

      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
        riskScore < 30 ? "bg-[var(--accent-mint)] text-green-800" :
        riskScore < 60 ? "bg-[var(--risk-medium)] text-yellow-900" :
        "bg-[var(--risk-high)] text-red-900"
      }`}>
        <span>{getRiskEmoji()}</span>
        <span>Risk Score: {riskScore}/100</span>
      </div>

      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-4 mb-4">
        <p className="text-sm text-foreground mb-2">If you deposit ${amount}:</p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>📈 Yearly: ${((parseFloat(amount) * supplyAPY) / 100).toFixed(2)}</li>
          <li>📅 Monthly: ${((parseFloat(amount) * supplyAPY) / 100 / 12).toFixed(2)}</li>
          <li>💰 Daily: ${((parseFloat(amount) * supplyAPY) / 100 / 365).toFixed(2)}</li>
        </ul>
      </div>

      {isSupported && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-foreground">Amount to deposit:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--glass-border)] rounded-lg bg-[var(--glass-bg)] text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-lavender)] focus:border-transparent placeholder-muted-foreground"
            placeholder="100"
            min="0"
            step="0.01"
          />
        </div>
      )}

      {isSupported ? (
        <DepositButton
          tokenSymbol={symbol}
          amount={amount}
          chainId={chainId}
          onSuccess={() => alert(`Successfully deposited ${amount} ${symbol}!`)}
          onError={(error) => alert(`Deposit failed: ${error.message}`)}
        />
      ) : (
        <div className="text-sm text-muted-foreground text-center py-3 bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)]">
          Deposit coming soon for {symbol}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer font-medium hover:text-foreground transition-colors">💡 What is APY?</summary>
          <p className="mt-2">
            APY (Annual Percentage Yield) is how much you earn per year. For example, {supplyAPY.toFixed(2)}% APY means ${amount} becomes ${(parseFloat(amount) * (1 + supplyAPY / 100)).toFixed(2)} after 1 year.
          </p>
        </details>
      </div>
    </div>
  );
}
