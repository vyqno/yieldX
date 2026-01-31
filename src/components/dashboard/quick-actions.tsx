"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: ArrowDownToLine,
      label: "Deposit",
      description: "Earn yield on Aave",
      color: "var(--brand-lavender-deep)",
      bg: "var(--accent-lavender)",
      onClick: () => router.push("/feed?action=deposit"),
    },
    {
      icon: ArrowUpFromLine,
      label: "Withdraw",
      description: "Get your funds back",
      color: "var(--info)",
      bg: "var(--accent-sky)",
      onClick: () => router.push("/feed?action=withdraw"),
    },
    {
      icon: ArrowLeftRight,
      label: "Swap",
      description: "Exchange on 1inch",
      color: "var(--risk-low)",
      bg: "var(--accent-mint)",
      onClick: () => window.open("https://app.1inch.io/", "_blank"),
    },
    {
      icon: MessageCircle,
      label: "YieldX AI",
      description: "Get suggestions",
      color: "var(--brand-coral)",
      bg: "var(--accent-blush)",
      onClick: () => {
        window.dispatchEvent(new CustomEvent("openAIChat", { 
          detail: { message: "What are the best yield opportunities right now?" } 
        }));
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action) => (
        <button
          type="button"
          key={action.label}
          onClick={action.onClick}
          className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-[1.02] transition-all duration-200"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: action.bg }}
          >
            <action.icon className="w-6 h-6" style={{ color: action.color }} />
          </div>
          <span className="font-semibold text-sm">{action.label}</span>
          <span className="text-xs text-muted-foreground text-center hidden md:block">
            {action.description}
          </span>
        </button>
      ))}
    </div>
  );
}
