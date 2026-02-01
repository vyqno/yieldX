"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] mt-20 relative z-10 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-lavender)] to-[var(--brand-lavender-deep)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="font-bold text-xl text-white">YieldX</span>
            </Link>
            <p className="mt-4 text-sm text-white/70">
              Your intelligent companion for navigating DeFi with confidence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/learn"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Learn
                </Link>
              </li>
              <li>
                <Link
                  href="/glossary"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Glossary
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/onboarding"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Get Started
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/yieldx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Protocols */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">
              Powered By
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://aave.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Aave V3
                </a>
              </li>
              <li>
                <a
                  href="https://thirdweb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Thirdweb
                </a>
              </li>
              <li>
                <a
                  href="https://alchemy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Alchemy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--glass-border)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/70">
              © 2026 YieldX. Built for IIT Roorkee Hackathon.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/60">
                Tracking: Aave V3 · Ethereum Mainnet
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
