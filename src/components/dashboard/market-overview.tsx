"use client";

import { ExternalLink, TrendingDown, TrendingUp } from "lucide-react";
import { GlassCard } from "./glass-card";

interface MarketAsset {
  symbol: string;
  supplyAPY: number;
  borrowAPY: number;
  change?: number;
}

interface MarketOverviewProps {
  assets: MarketAsset[];
  loading?: boolean;
}

export function MarketOverview({ assets, loading }: MarketOverviewProps) {
  if (loading) {
    return <MarketOverviewSkeleton />;
  }

  return (
    <GlassCard className="col-span-2 lg:col-span-1 row-span-2 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Aave Markets</h3>
        <a
          href="https://app.aave.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View on Aave
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-muted-foreground font-medium">
          <span>Asset</span>
          <span className="text-right">Supply</span>
          <span className="text-right">Borrow</span>
          <span className="text-right">24h</span>
        </div>

        {/* Assets */}
        {assets.slice(0, 8).map((asset) => (
          <div
            key={asset.symbol}
            className="grid grid-cols-4 gap-2 px-3 py-3 rounded-lg hover:bg-[var(--glass-bg)] transition-colors cursor-pointer"
          >
            <span className="font-medium">{asset.symbol}</span>
            <span className="text-right text-data text-green-600">
              {asset.supplyAPY.toFixed(2)}%
            </span>
            <span className="text-right text-data text-red-500">
              {asset.borrowAPY.toFixed(2)}%
            </span>
            <span
              className={`text-right flex items-center justify-end gap-1 ${
                (asset.change ?? 0) >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {(asset.change ?? 0) >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(asset.change ?? 0).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
        <p className="text-xs text-muted-foreground text-center">
          Showing top 8 assets by TVL
        </p>
      </div>
    </GlassCard>
  );
}

function MarketOverviewSkeleton() {
  return (
    <div className="glass-card col-span-2 lg:col-span-1 row-span-2 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-28 h-6 bg-muted rounded" />
        <div className="w-24 h-4 bg-muted rounded" />
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-4 gap-2 px-3 py-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-12 h-4 bg-muted rounded" />
          ))}
        </div>

        {[...Array(8)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 px-3 py-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="w-12 h-4 bg-muted rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
