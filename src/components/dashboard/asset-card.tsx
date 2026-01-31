"use client";

import { useState } from "react";
import { Info, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AssetCardProps {
  symbol: string;
  name: string;
  supplyAPY: number;
  borrowAPY?: number;
  utilizationRate?: number;
  category?: string;
  riskLevel: "low" | "medium" | "high";
  color: string;
}

const riskConfig = {
  low: {
    label: "Low Risk",
    bg: "var(--accent-mint)",
    text: "#15803d",
    dot: "var(--risk-low)",
    description: "Highly stable asset with strong liquidity and low volatility.",
  },
  medium: {
    label: "Medium",
    bg: "#fef3c7",
    text: "#b45309",
    dot: "var(--risk-medium)",
    description: "Moderate volatility. Suitable for balanced portfolios.",
  },
  high: {
    label: "High Risk",
    bg: "#fee2e2",
    text: "#b91c1c",
    dot: "var(--risk-high)",
    description: "Higher volatility and potential for liquidation. DYOR.",
  },
};

export function AssetCard({
  symbol,
  name,
  supplyAPY,
  borrowAPY = 0,
  utilizationRate = 0,
  category = "Stablecoin",
  riskLevel,
  color,
}: AssetCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const risk = riskConfig[riskLevel];

  return (
    <div
      className="relative h-[250px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 glass-card"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: color }}
            >
              {symbol.charAt(0)}
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: risk.bg, color: risk.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: risk.dot }} />
              {risk.label}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-lg">{symbol}</h3>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Supply APY</p>
              <p className="text-2xl font-bold text-data" style={{ color }}>
                {supplyAPY.toFixed(2)}%
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5" />
              <span>Click for details</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 glass-card"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: color }}
              >
                {symbol.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{symbol}</h4>
                <p className="text-xs text-muted-foreground">{category}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supply APY</span>
              <span className="font-medium" style={{ color: "var(--risk-low)" }}>{supplyAPY.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Borrow APY</span>
              <span className="font-medium" style={{ color: "var(--risk-high)" }}>{borrowAPY.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utilization</span>
              <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{risk.description}</p>
            </div>
            <Link
              href={`/feed?symbol=${symbol}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full mt-2 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--brand-lavender-deep)" }}
            >
              View Pool <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="glass-card h-[250px]">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
        <div className="w-20 h-6 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="mb-4">
        <div className="w-16 h-5 bg-muted rounded mb-2 animate-pulse" />
        <div className="w-24 h-4 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="w-16 h-3 bg-muted rounded mb-2 animate-pulse" />
          <div className="w-20 h-8 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
