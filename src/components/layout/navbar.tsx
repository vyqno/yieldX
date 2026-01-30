"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/core/theme-toggle";
import { WalletConnectButton } from "@/components/wallet-provider";
import { useUIStore } from "@/lib/store/ui-store";
import { Bot, Sparkles } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/glossary", label: "Glossary" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="glass rounded-2xl px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-lavender)] to-[var(--brand-lavender-deep)] flex items-center justify-center shadow-lg group-hover:shadow-[var(--glow-lavender)] transition-shadow duration-300">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">
                YieldX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? "bg-[var(--accent-lavender)] text-[var(--brand-lavender-deep)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden md:block">
                <button
                  onClick={() => useUIStore.getState().toggleChat()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--accent-lavender)] hover:bg-[var(--brand-lavender)]/20 text-[var(--brand-lavender-deep)] font-medium transition-colors text-sm"
                >
                  <Bot className="w-4 h-4" />
                  <span className="hidden lg:inline">Ask AI</span>
                </button>
              </div>
              <div className="hidden md:block">
                <WalletConnectButton />
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden glass-button p-2 rounded-full"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-[var(--glass-border)]">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname === link.href
                        ? "bg-[var(--accent-lavender)] text-[var(--brand-lavender-deep)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2">
                  <WalletConnectButton />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
