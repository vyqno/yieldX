import type { Metadata } from "next";
import { DM_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorBoundary } from "@/components/error-boundary";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "YieldX | Real-time DeFi Yield Tracker",
  description:
    "Track, compare, and optimize your stablecoin yields across Aave protocol with real-time data and AI-powered insights. The future of DeFi is beautiful.",
  keywords: [
    "DeFi",
    "Yield",
    "Aave",
    "Stablecoins",
    "APY",
    "USDC",
    "USDT",
    "USDe",
    "crvUSD",
    "Crypto",
    "Ethereum",
    "YieldX",
  ],
  openGraph: {
    title: "YieldX | Real-time DeFi Yield Tracker",
    description:
      "The future of DeFi is beautiful. Track yields with confidence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${dmSans.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
