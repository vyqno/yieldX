"use client";

import { useEffect, useState, useMemo } from "react";
import { useActiveAccount } from "thirdweb/react";
import Link from "next/link";
import { Search, SlidersHorizontal, Heart, Star } from "lucide-react";
import { LiquidBackground } from "@/components/core/liquid-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/dashboard/glass-card";
import { AIChat } from "@/components/ai-chat";
import { PoolCardSimple } from "@/components/pool-card-simple";
import { useToast } from "@/components/toast";
import { useFavorites } from "@/hooks/use-favorites";
import { motion, AnimatePresence } from "framer-motion";
import { calculateRiskScore, type RiskScore } from "@/lib/risk-score";
import { getWalletBalances, getAavePositions } from "@/lib/wallet-data";
import type { AssetYieldData } from "@/lib/dynamic-fetcher";

interface YieldCard {
  id: string;
  symbol: string;
  apy: number;
  category: string;
  riskScore: RiskScore;
  rawAsset: AssetYieldData;
}

type SortOption = "apy-high" | "apy-low" | "risk-low" | "risk-high" | "name";
type CategoryFilter = "all" | "Stablecoin" | "ETH & LST" | "BTC" | "Governance" | "Other";

const CATEGORIES: CategoryFilter[] = ["all", "Stablecoin", "ETH & LST", "BTC", "Governance", "Other"];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "apy-high", label: "APY: High to Low" },
  { value: "apy-low", label: "APY: Low to High" },
  { value: "risk-low", label: "Risk: Safest First" },
  { value: "risk-high", label: "Risk: Highest First" },
  { value: "name", label: "Name: A to Z" },
];

export default function FeedPage() {
  const account = useActiveAccount();
  const { addToast } = useToast();
  const { favorites, toggleFavorite, isFavorite, isLoaded: favoritesLoaded } = useFavorites();

  const [cards, setCards] = useState<YieldCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState("0.00");
  const [totalEarnings, setTotalEarnings] = useState("0.00");
  const [depositAsset, setDepositAsset] = useState<YieldCard | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("apy-high");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchYields(); }, []);

  useEffect(() => {
    if (!account) {
      setPortfolioValue("0.00");
      setTotalEarnings("0.00");
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
        if (positions.length > 0) addToast(`Found ${positions.length} active position${positions.length > 1 ? "s" : ""}`, "success");
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      }
    }
    fetchPortfolio();
  }, [account, addToast]);

  const fetchYields = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/yields");
      const data = await res.json();
      if (data.success) {
        const mapped = data.assets.slice(0, 30).map((asset: AssetYieldData, idx: number) => {
          const riskScore = calculateRiskScore(asset);
          return { id: asset.symbol + idx, symbol: asset.symbol, apy: asset.supplyAPY, category: asset.category, riskScore, rawAsset: asset };
        });
        setCards(mapped);
        addToast(`Loaded ${mapped.length} yield opportunities`, "success");
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch:", error);
      addToast("Network error - please try again", "error");
      setLoading(false);
    }
  };

  const filteredAndSortedCards = useMemo(() => {
    let result = [...cards];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((card) => card.symbol.toLowerCase().includes(query) || card.category.toLowerCase().includes(query));
    }
    if (categoryFilter !== "all") result = result.filter((card) => card.category === categoryFilter);
    result.sort((a, b) => {
      switch (sortOption) {
        case "apy-high": return b.apy - a.apy;
        case "apy-low": return a.apy - b.apy;
        case "risk-low": return a.riskScore.score - b.riskScore.score;
        case "risk-high": return b.riskScore.score - a.riskScore.score;
        case "name": return a.symbol.localeCompare(b.symbol);
        default: return 0;
      }
    });
    return result;
  }, [cards, searchQuery, categoryFilter, sortOption]);

  const favoriteCards = useMemo(() => {
    if (!favoritesLoaded) return [];
    return cards.filter((card) => favorites.includes(card.symbol));
  }, [cards, favorites, favoritesLoaded]);

  const handleFavoriteToggle = (symbol: string) => {
    toggleFavorite(symbol);
    if (isFavorite(symbol)) addToast(`Removed ${symbol} from favorites`, "info");
    else addToast(`Added ${symbol} to favorites`, "success");
  };

  const getRiskColor = (score: number) => score <= 30 ? "var(--risk-low)" : score <= 60 ? "var(--risk-medium)" : "var(--risk-high)";
  const getRiskBg = (score: number) => score <= 30 ? "var(--accent-mint)" : score <= 60 ? "#fef3c7" : "#fee2e2";
  const getRiskLabel = (score: number) => score <= 30 ? "Low" : score <= 60 ? "Medium" : "High";

  const renderCard = (card: YieldCard, index: number) => (
    <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md" style={{ backgroundColor: "var(--brand-lavender-deep)" }}>
              {card.symbol.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{card.symbol}</h3>
              <p className="text-sm text-muted-foreground">{card.category}</p>
            </div>
          </div>
          <button onClick={() => handleFavoriteToggle(card.symbol)} className="w-10 h-10 rounded-xl flex items-center justify-center glass-button" style={{ color: isFavorite(card.symbol) ? "var(--brand-coral)" : "var(--muted-foreground)" }}>
            <Heart className="w-5 h-5" fill={isFavorite(card.symbol) ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold text-data" style={{ color: "var(--brand-lavender-deep)" }}>{card.apy.toFixed(2)}%</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: getRiskBg(card.riskScore.score), color: getRiskColor(card.riskScore.score) }}>{getRiskLabel(card.riskScore.score)} Risk</span>
          </div>
          <p className="text-sm text-muted-foreground">Annual Percentage Yield</p>
        </div>

        <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: "var(--accent-lavender)" }}>
          <div className="text-xs text-muted-foreground mb-2 font-medium">IF YOU INVEST $1,000</div>
          <div className="grid grid-cols-3 gap-3">
            <div><div className="text-xs text-muted-foreground">Daily</div><div className="font-semibold text-data" style={{ color: "var(--brand-lavender-deep)" }}>${((1000 * card.apy) / 100 / 365).toFixed(2)}</div></div>
            <div><div className="text-xs text-muted-foreground">Weekly</div><div className="font-semibold text-data" style={{ color: "var(--risk-low)" }}>${((1000 * card.apy) / 100 / 52).toFixed(2)}</div></div>
            <div><div className="text-xs text-muted-foreground">Monthly</div><div className="font-semibold text-data" style={{ color: "var(--info)" }}>${((1000 * card.apy) / 100 / 12).toFixed(2)}</div></div>
          </div>
        </div>

        <button onClick={() => setDepositAsset(card)} className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90" style={{ backgroundColor: "var(--brand-lavender-deep)" }}>
          Deposit Now
        </button>
      </GlassCard>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative bg-background">
      <LiquidBackground preset="Blue" />
      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-display-md mb-2">Explore Yields</h1>
          <p className="text-muted-foreground">Discover and compare yield opportunities across Aave V3</p>
        </div>

        {account && (
          <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <GlassCard className="p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Portfolio</div>
              <div className="text-2xl font-bold">${portfolioValue}</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Earnings</div>
              <div className="text-2xl font-bold" style={{ color: "var(--risk-low)" }}>+${totalEarnings}</div>
            </GlassCard>
          </div>
        )}

        <div className="mb-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <GlassCard className="p-3">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <input type="text" placeholder="Search by token or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground" />
              <button onClick={() => setShowFilters(!showFilters)} className="p-2 rounded-lg transition-colors hover:bg-muted" style={{ color: showFilters ? "var(--brand-lavender-deep)" : "var(--muted-foreground)" }}>
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </GlassCard>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <GlassCard className="p-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button key={cat} onClick={() => setCategoryFilter(cat)} className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all" style={{ backgroundColor: categoryFilter === cat ? "var(--brand-lavender-deep)" : "var(--muted)", color: categoryFilter === cat ? "white" : "inherit" }}>
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Sort by</label>
                  <select value={sortOption} onChange={(e) => setSortOption(e.target.value as SortOption)} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-lavender)]">
                    {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {favoriteCards.length > 0 && (
          <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-heading-md mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" style={{ color: "var(--brand-coral)" }} />Favorites ({favoriteCards.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{favoriteCards.map((card, index) => renderCard(card, index))}</div>
          </div>
        )}

        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-md">{searchQuery || categoryFilter !== "all" ? "Results" : "All Opportunities"} ({filteredAndSortedCards.length})</h2>
            <button onClick={fetchYields} disabled={loading} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--brand-lavender-deep)" }}>{loading ? "Loading..." : "Refresh"}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-5 h-[300px] animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-xl mb-4" />
                <div className="h-6 w-24 bg-muted rounded mb-2" />
                <div className="h-10 w-32 bg-muted rounded mb-4" />
                <div className="h-20 bg-muted rounded mb-4" />
                <div className="h-12 bg-muted rounded" />
              </div>
            ))
          ) : filteredAndSortedCards.length === 0 ? (
            <div className="col-span-2 text-center py-12 glass-card">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-2">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <AnimatePresence>{filteredAndSortedCards.map((card, index) => renderCard(card, index))}</AnimatePresence>
          )}
        </div>
      </main>

      <AnimatePresence>
        {depositAsset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setDepositAsset(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative max-w-md w-full">
              <button onClick={() => setDepositAsset(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors">✕</button>
              <PoolCardSimple symbol={depositAsset.symbol} category={depositAsset.category} supplyAPY={depositAsset.apy} chainId="mainnet" riskScore={depositAsset.riskScore.score} riskLevel={depositAsset.riskScore.level} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIChat />
      <Footer />
    </div>
  );
}
