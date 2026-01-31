"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, ShieldCheck, Coins, ArrowRight, PlayCircle, TrendingUp } from "lucide-react";
import { LiquidBackground } from "@/components/core/liquid-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface Module {
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  icon: any;
  slug: string;
  color: string;
}

const MODULES: Module[] = [
  {
    title: "DeFi 101: The Basics",
    description: "Start here. Understand how decentralized finance works, what smart contracts are, and how effective yields are generated.",
    level: "Beginner",
    duration: "5 min read",
    icon: GraduationCap,
    slug: "defi-basics",
    color: "var(--brand-lavender-deep)"
  },
  {
    title: "Mastering Aave V3",
    description: "Deep dive into Aave's specific features: E-Mode, Isolation Mode, and how to safely borrow against your assets.",
    level: "Intermediate",
    duration: "10 min read",
    icon: Coins,
    slug: "mastering-aave",
    color: "var(--brand-blue)"
  },
  {
    title: "Risk Management",
    description: "Learn how to calculate your Health Factor, avoid liquidation, and understand smart contract risks.",
    level: "Intermediate",
    duration: "8 min read",
    icon: ShieldCheck,
    slug: "risk-management",
    color: "var(--risk-low)"
  },
  {
    title: "Advanced Yield Strategies",
    description: "Explore leveraged yield farming (looping), stablecoin arbitrage, and delta-neutral strategies using YieldCopilot.",
    level: "Advanced",
    duration: "15 min read",
    icon: TrendingUp,
    slug: "strategies",
    color: "var(--brand-coral)"
  }
];

export default function LearnPage() {
  return (
    <div className="min-h-screen relative bg-background">
      <LiquidBackground preset="Prism" />
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-display-md mb-4">Learn Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Your roadmap to becoming a DeFi expert. From first deposit to advanced automated strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {/* Featured Course */}
          <div className="glass-card col-span-1 md:col-span-2 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand-lavender)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--brand-lavender)]/30 transition-all duration-500" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-lavender-deep)] text-white text-xs font-bold mb-4">
                  NEW
                </div>
                <h2 className="text-3xl font-bold mb-3">YieldCopilot Academy</h2>
                <p className="text-muted-foreground mb-6 max-w-xl">
                  A comprehensive video course designed to take you from 0 to 100 in decentralized lending. 
                  Learn how our AI agent analyzes market signals.
                </p>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--brand-lavender-deep)] text-white font-semibold hover:opacity-90 transition-opacity">
                  <PlayCircle className="w-5 h-5" /> Start Course
                </button>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                 <div className="w-32 h-32 rounded-2xl bg-white/50 border border-white/60 shadow-xl flex items-center justify-center rotate-3 group-hover:rotate-6 transition-transform duration-300">
                    <BookOpen className="w-16 h-16 text-[var(--brand-lavender-deep)]" />
                 </div>
              </div>
            </div>
          </div>

          {MODULES.map((module) => (
            <div
              key={module.slug} 
              className="glass-card p-8 cursor-pointer group hover:bg-white/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--accent-lavender)] group-hover:scale-110 transition-transform duration-300">
                  <module.icon className="w-6 h-6" style={{ color: module.color }} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    module.level === "Beginner" ? "bg-green-100 text-green-700" :
                    module.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {module.level}
                  </span>
                  <span className="text-xs text-muted-foreground">{module.duration}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--brand-lavender-deep)] transition-colors">
                {module.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {module.description}
              </p>
              
              <div className="flex items-center text-sm font-semibold text-[var(--brand-lavender-deep)]">
                Read Guide <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 text-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
           <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
           <p className="text-muted-foreground mb-4">Our community of experts is here to help you navigate the markets.</p>
           <Link href="/about" className="text-[var(--brand-lavender-deep)] font-semibold hover:underline">
             Contact Support &rarr;
           </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
