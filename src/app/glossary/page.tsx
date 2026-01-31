"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { LiquidBackground } from "@/components/core/liquid-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/dashboard/glass-card";

interface Term {
  term: string;
  definition: string;
  category: "General" | "Aave" | "Risk" | "Strategy";
}

const GLOSSARY_TERMS: Term[] = [
  {
    term: "APY (Annual Percentage Yield)",
    definition: "The real rate of return earned on a deposit, taking into account the effect of compounding interest.",
    category: "General"
  },
  {
    term: "LTV (Loan-to-Value)",
    definition: "The maximum amount you can borrow against your collateral (e.g., 80% LTV means borrowing $80 for $100 deposit).",
    category: "Risk"
  },
  {
    term: "Health Factor",
    definition: "A safety score for your loan. If it drops below 1.0, your collateral can be liquidated. Keep it above 1.5 for safety.",
    category: "Risk"
  },
  {
    term: "Liquidation Threshold",
    definition: "The collateral percentage at which a position is considered undercollateralized and subject to liquidation.",
    category: "Risk"
  },
  {
    term: "Flash Loan",
    definition: "Uncollateralized loan that must be borrowed and repaid within the same transaction block.",
    category: "Aave"
  },
  {
    term: "Utilization Rate",
    definition: "Percentage of the liquidity pool currently borrowed. High utilization spikes interest rates.",
    category: "General"
  },
  {
    term: "Reserve Factor",
    definition: "Percentage of borrower interest allocated to the protocol treasury.",
    category: "Aave"
  },
  {
    term: "Isolation Mode",
    definition: "Risk management where specific risky assets can only be used to borrow stablecoins.",
    category: "Aave"
  },
  {
    term: "Collateral",
    definition: "Assets deposited to secure a loan. Seized if health factor drops below 1.",
    category: "General"
  }
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(GLOSSARY_TERMS.map(t => t.category)))];

  const filteredTerms = GLOSSARY_TERMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || 
                          item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="min-h-screen relative bg-background">
      <LiquidBackground preset="Mist" />
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-display-md mb-4">DeFi Glossary</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Master the terminology of decentralized finance.
          </p>
        </div>

        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search terms..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-lavender)]"
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? "bg-[var(--brand-lavender-deep)] text-white" 
                      : "bg-[var(--accent-lavender)] text-foreground hover:bg-[var(--brand-lavender)]/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-4">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No terms found matching your search.
            </div>
          ) : (
            filteredTerms.map((item) => (
              <GlassCard 
                key={item.term} 
                className="cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedTerm(expandedTerm === item.term ? null : item.term)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-[var(--accent-lavender)] text-[var(--brand-lavender-deep)]">
                        {item.category}
                      </span>
                      <h3 className="text-lg font-bold">{item.term}</h3>
                    </div>
                    {expandedTerm === item.term ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                  </div>
                  
                  {expandedTerm === item.term && (
                    <div className="pt-4 text-muted-foreground leading-relaxed border-t border-[var(--border)] mt-4 animate-fade-in-up">
                      {item.definition}
                    </div>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
