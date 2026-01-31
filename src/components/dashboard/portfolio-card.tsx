"use client";

import { ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import { GlassCard } from "./glass-card";

interface PortfolioCardProps {
  totalValue: number;
  totalEarnings: number;
  percentChange: number;
  assetCount: number;
}

export function PortfolioCard({
  totalValue,
  totalEarnings,
  percentChange,
  assetCount,
}: PortfolioCardProps) {
  const isPositive = percentChange >= 0;

  return (
    <GlassCard className="col-span-2 row-span-2 p-8">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-lavender)] to-[var(--brand-lavender-deep)] flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Portfolio Overview</h2>
              <p className="text-sm text-muted-foreground">
                {assetCount} assets tracked
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-lavender)] text-[var(--brand-lavender-deep)] text-sm font-medium hover:bg-[var(--brand-lavender)] hover:text-white transition-colors"
          >
            View Details
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Total Value */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground mb-2">Total Value</p>
          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-bold text-data">
              $
              {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                isPositive
                  ? "bg-[var(--accent-mint)] text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${!isPositive && "rotate-180"}`}
              />
              {isPositive ? "+" : ""}
              {percentChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Earnings & Chart placeholder */}
        <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-semibold text-data text-green-600">
                +$
                {totalEarnings.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Mini sparkline placeholder */}
            <div className="flex items-end gap-1 h-12">
              {[40, 55, 45, 65, 50, 70, 60, 80, 75, 90].map((height, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full bg-[var(--brand-lavender)]"
                  style={{
                    height: `${height}%`,
                    opacity: 0.5 + i * 0.05,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export function PortfolioCardSkeleton() {
  return (
    <div className="glass-card col-span-2 row-span-2 p-8 animate-pulse">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted" />
            <div>
              <div className="w-32 h-5 bg-muted rounded mb-2" />
              <div className="w-24 h-4 bg-muted rounded" />
            </div>
          </div>
          <div className="w-28 h-10 bg-muted rounded-full" />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="w-24 h-4 bg-muted rounded mb-3" />
          <div className="w-48 h-12 bg-muted rounded" />
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-24 h-4 bg-muted rounded mb-2" />
              <div className="w-32 h-8 bg-muted rounded" />
            </div>
            <div className="flex items-end gap-1 h-12">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-2 h-8 bg-muted rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
