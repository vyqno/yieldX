"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items?: FAQItem[];
  className?: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "What is YieldX?",
    answer:
      "YieldX is a real-time DeFi yield tracking platform that helps you discover, compare, and optimize stablecoin yields across Aave protocol and other DeFi platforms.",
  },
  {
    question: "How do I connect my wallet?",
    answer:
      "Click the 'Connect' button in the top right corner. You'll need a Web3 wallet like MetaMask installed. Once connected, you can view your portfolio and track personalized yield opportunities.",
  },
  {
    question: "What stablecoins are supported?",
    answer:
      "We track yields for major stablecoins including USDC, USDT, DAI, FRAX, crvUSD, USDe, PYUSD, and GHO across the Ethereum mainnet.",
  },
  {
    question: "Is YieldX free to use?",
    answer:
      "Yes! YieldX is completely free to use. We provide real-time yield data, comparisons, and AI-powered insights at no cost.",
  },
  {
    question: "How often is yield data updated?",
    answer:
      "Yield data is fetched in real-time from blockchain sources. The dashboard auto-refreshes every 30 seconds to ensure you always see the most current APY rates.",
  },
  {
    question: "What is the AI Copilot feature?",
    answer:
      "The AI Copilot is an intelligent assistant that analyzes yield opportunities and provides personalized recommendations based on your risk tolerance and investment goals.",
  },
];

export function FAQAccordion({
  items = defaultFAQs,
  className = "",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {/* Question Header */}
            <button
              type="button"
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
            >
              <span className="font-medium text-lg pr-4">{item.question}</span>
              <div
                className="flex-shrink-0 transition-transform duration-300"
                style={{
                  transform:
                    openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <ChevronDown className="w-5 h-5 text-[var(--brand-lavender)]" />
              </div>
            </button>

            {/* Answer Content */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: openIndex === index ? "500px" : "0px",
                opacity: openIndex === index ? 1 : 0,
              }}
            >
              <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQAccordion;
