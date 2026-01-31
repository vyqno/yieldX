"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LiquidBackground } from "@/components/core/liquid-background";
import { AssetCard, AssetCardSkeleton } from "@/components/dashboard/asset-card";
import { GlassCard } from "@/components/dashboard/glass-card";
import { LiveChainStats } from "@/components/dashboard/live-chain-stats";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { PortfolioCard, PortfolioCardSkeleton } from "@/components/dashboard/portfolio-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AIChat } from "@/components/ai-chat";
import { useActiveAccount } from "thirdweb/react";
import { useToast } from "@/components/toast";
import { getWalletBalances, getAavePositions } from "@/lib/wallet-data";

interface AssetYieldData {
  symbol: string;
  name: string;
  address: string;
  category: string;
  supplyAPY: number;
  borrowAPY: number;
  utilizationRate: number;
  totalSupplied?: number;
  totalBorrowed?: number;
}

const featuredAssetsPreset = [
  { symbol: "USDC", name: "USD Coin", color: "#2775CA", riskLevel: "low" as const },
  { symbol: "USDT", name: "Tether", color: "#26A17B", riskLevel: "low" as const },
  { symbol: "USDe", name: "Ethena USDe", color: "#00D4AA", riskLevel: "medium" as const },
  { symbol: "crvUSD", name: "Curve USD", color: "#FF6B9D", riskLevel: "medium" as const },
];

export default function DashboardPage() {
  const [yields, setYields] = useState<AssetYieldData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const account = useActiveAccount();
  const { addToast } = useToast();
  const [portfolioValue, setPortfolioValue] = useState("0.00");
  const [totalEarnings, setTotalEarnings] = useState("0.00");
  const [assetCount, setAssetCount] = useState(0);

  useEffect(() => {
    async function fetchYields() {
      try {
        const response = await fetch("/api/yields");
        if (!response.ok) throw new Error("Failed to fetch yields");
        const data = await response.json();
        setYields(data.assets || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchYields();
    const interval = setInterval(fetchYields, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!account) {
      setPortfolioValue("0.00");
      setTotalEarnings("0.00");
      setAssetCount(0);
      return;
    }

    async function fetchPortfolio() {
      try {
        const [balances, positions] = await Promise.all([
          getWalletBalances(account!.address, "mainnet"),
          getAavePositions(account!.address, "mainnet"),
        ]);

        const totalBalance = balances.reduce((sum, b) => {
          const balance = parseFloat(b.balance || "0");
          if (["USDC", "USDT", "DAI", "USDe", "crvUSD"].includes(b.symbol)) return sum + balance;
          return sum;
        }, 0);

        const totalDeposited = positions.reduce((sum, p) => sum + parseFloat(p.currentValue || "0"), 0);
        const earnings = positions.reduce((sum, p) => sum + parseFloat(p.earnedInterest || "0"), 0);

        setPortfolioValue((totalBalance + totalDeposited).toFixed(2));
        setTotalEarnings(earnings.toFixed(2));
        setAssetCount(positions.length);

        if (positions.length > 0) {
          addToast(`Found ${positions.length} active position${positions.length > 1 ? "s" : ""}`, "success");
        }
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      }
    }
    fetchPortfolio();
  }, [account, addToast]);

  const getFeaturedAssetData = (symbol: string) => {
    return yields.find((y) => y.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const portfolioStats = {
    totalValue: parseFloat(portfolioValue),
    totalEarnings: parseFloat(totalEarnings),
    percentChange: parseFloat(totalEarnings) > 0 ? (parseFloat(totalEarnings) / Math.max(parseFloat(portfolioValue), 1)) * 100 : 0,
    assetCount: assetCount > 0 ? assetCount : yields.length,
  };

  const marketAssets = yields.slice(0, 10).map((asset) => ({
    symbol: asset.symbol,
    supplyAPY: asset.supplyAPY,
    borrowAPY: asset.borrowAPY,
    change: 0,
  }));

  return (
    <div className="min-h-screen relative bg-background">
      <LiquidBackground preset="Blue" />
      <Navbar />

      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-display-md mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your yields and discover new opportunities</p>
        </div>

        <div className="mb-12 glass-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <LiveChainStats refreshInterval={10000} />
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        <div className="bento-grid">
          <div className="bento-item-wide animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            {loading ? <PortfolioCardSkeleton /> : <PortfolioCard {...portfolioStats} />}
          </div>

          <div className="bento-item-wide animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <GlassCard>
              <div className="mb-4">
                <h3 className="text-heading-md">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Common operations</p>
              </div>
              <QuickActions />
            </GlassCard>
          </div>

          {loading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
                  <AssetCardSkeleton />
                </div>
              ))
            : featuredAssetsPreset.map((asset, i) => {
                const data = getFeaturedAssetData(asset.symbol);
                return (
                  <div key={asset.symbol} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
                    <AssetCard
                      symbol={asset.symbol}
                      name={asset.name}
                      supplyAPY={data?.supplyAPY ?? 0}
                      borrowAPY={data?.borrowAPY ?? 0}
                      utilizationRate={data?.utilizationRate ?? 0}
                      category={data?.category ?? "Stablecoin"}
                      riskLevel={asset.riskLevel}
                      color={asset.color}
                    />
                  </div>
                );
              })}

          <div className="bento-item-wide animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-heading-md">Market Overview</h3>
                  <p className="text-sm text-muted-foreground">Top performing assets</p>
                </div>
                <Link href="/feed" className="flex items-center gap-1 text-sm text-[var(--brand-lavender-deep)] hover:opacity-80 transition-opacity">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <MarketOverview assets={marketAssets} loading={loading} />
            </GlassCard>
          </div>

          <div className="bento-item-wide animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
            <GlassCard>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-lavender)] flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-[var(--brand-lavender-deep)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">New to DeFi?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Learn about yields, risks, and strategies.</p>
                  <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-lavender-deep)] hover:opacity-80 transition-opacity">
                    Explore Yields <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="bento-item-lg animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-heading-md">All Aave Markets</h3>
                  <p className="text-sm text-muted-foreground">{yields.length} assets tracked live</p>
                </div>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="text-left text-sm text-muted-foreground border-b border-border">
                        <th className="pb-3 font-medium">Asset</th>
                        <th className="pb-3 font-medium text-right">Supply APY</th>
                        <th className="pb-3 font-medium text-right">Borrow APY</th>
                        <th className="pb-3 font-medium text-right">Utilization</th>
                        <th className="pb-3 font-medium text-right">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yields.slice(0, 12).map((asset) => (
                        <tr key={asset.symbol} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[var(--accent-lavender)] flex items-center justify-center text-sm font-bold text-[var(--brand-lavender-deep)]">
                                {asset.symbol.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium">{asset.symbol}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[100px]">{asset.name || asset.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-data font-medium" style={{ color: "var(--risk-low)" }}>{asset.supplyAPY.toFixed(2)}%</span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-data font-medium" style={{ color: "var(--risk-high)" }}>{asset.borrowAPY.toFixed(2)}%</span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${asset.utilizationRate}%`, backgroundColor: "var(--brand-lavender)" }} />
                              </div>
                              <span className="text-data text-xs">{asset.utilizationRate.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-lavender)] text-[var(--brand-lavender-deep)]">{asset.category}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>

      <AIChat />
      <Footer />
    </div>
  );
}
