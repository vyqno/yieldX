"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, Brain, Globe, TrendingUp, Users } from "lucide-react";
import { LiquidBackground } from "@/components/core/liquid-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlassCard } from "@/components/dashboard/glass-card";

export default function AboutPage() {
  return (
    <div className="min-h-screen relative bg-background">
      <LiquidBackground preset="Prism" />
      <Navbar />

      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-display-lg mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[var(--brand-lavender-deep)] to-[var(--brand-lavender)]">
            Redefining DeFi Yield Tracking
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            YieldCopilot is the intelligent interface for Aave V3. We combine real-time on-chain data with AI-powered insights to help you maximize returns while minimizing risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          {[
            {
              icon: Zap,
              title: "Real-Time Data",
              desc: "Direct access to on-chain events. No stale APIs—see every deposit, borrow, and rate change as it happens.",
              color: "var(--brand-lavender-deep)"
            },
            {
              icon: Brain,
              title: "AI Optimization",
              desc: "Our AI agent analyzes market conditions around the clock to suggest the best lending and borrowing strategies.",
              color: "var(--brand-blue)"
            },
            {
              icon: Shield,
              title: "Risk First",
              desc: "Advanced health monitoring calls out risky positions before you get liquidated. Safety is our priority.",
              color: "var(--risk-low)"
            }
          ].map((feature, i) => (
            <GlassCard key={i} className="p-8 text-center h-full">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-white/50 shadow-inner">
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div>
            <h2 className="text-display-md mb-6">Built for the Future of Finance</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-lavender)] flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-[var(--brand-lavender-deep)]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Universal Access</h4>
                  <p className="text-muted-foreground">Accessible to anyone, anywhere. Seamlessly connect with any Web3 wallet.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-mint)] flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-[var(--risk-low)]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Transparency</h4>
                  <p className="text-muted-foreground">Every stat is verifiable on-chain. We don&apos;t hide behind black boxes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-peach)] flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-[var(--brand-coral)]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Community Driven</h4>
                  <p className="text-muted-foreground">Built by DeFi natives for DeFi natives. Your feedback shapes our roadmap.</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 shadow-lg hover:shadow-[var(--brand-lavender)/20]" style={{ backgroundColor: "var(--brand-lavender-deep)" }}>
                Launch App <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="relative h-[500px] w-full">
            {/* Abstract visual composition using glass cards */}
            <div className="absolute top-10 left-10 right-10 bottom-10 glass-card p-8 flex items-center justify-center z-10">
               <div className="text-center">
                 <div className="text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-br from-[var(--brand-lavender)] to-[var(--brand-blue)]">
                   $89.7B+
                 </div>
                 <div className="text-xl text-muted-foreground uppercase tracking-widest">Protocol Volume</div>
               </div>
            </div>
            
            <div className="absolute top-0 right-0 glass-card p-6 w-48 z-20 animate-float" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center text-white text-xs font-bold">U</div>
                <div>
                  <div className="font-bold text-sm">USDC</div>
                  <div className="text-[10px] text-muted-foreground">Stablecoin</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--risk-low)]">High Yield</div>
            </div>

            <div className="absolute bottom-0 left-0 glass-card p-6 w-56 z-20 animate-float" style={{ animationDelay: "2s" }}>
              <div className="text-sm font-medium mb-2 text-muted-foreground">Total Active Markets</div>
              <div className="text-3xl font-bold">60+ Assets</div>
              <div className="mt-2 text-xs text-muted-foreground">Across Ethereum Mainnet</div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
