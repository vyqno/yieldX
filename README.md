# YieldX 🤖💸

> **The Intelligent Interface for DeFi Yields.**
> 
> *Hackathon Submission 2026*

YieldX is a real-time Web3 yield tracking platform that aggregates APY data from the Aave protocol. It is designed to provide developers and users with instant, low-latency access to DeFi market data.

![YieldX Dashboard](https://via.placeholder.com/800x400?text=YieldX+Dashboard+Preview)

## 🏆 Problem Statement Solved

We have built a comprehensive platform that addresses every requirement:

*   **✅ Assets Supported**: Full tracking for **USDC, USDT, USDe, crvUSD**, and 50+ other assets.
*   **✅ Low Latency**: Implemented a **Redis-backed Caching Layer** (Upstash) to serve yields in <10ms.
*   **✅ Scalable Backend**: Built on Next.js 16 with a background worker that continuously ingests on-chain data.
*   **✅ Public API**: Fully documented REST API for developers (See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)).
*   **✅ Live Updates**: WebSocket integration for real-time push notifications of yield changes.
*   **✅ AI Integration (USP)**: A context-aware **AI Agent** that can analyze your wallet safety and recommend pools.

## 🚀 Key Features

### 1. Real-Time Dashboard
*   Visualizes market utilization, liquidity, and Health Factors.
*   Glassmorphism UI design for a premium experience.
*   Instant search and filtering by category (Stablecoins, LSTs, etc.).

### 2. Developer API
*   Clean, RESTful endpoints (`/api/yields`).
*   Rate-limited and production-ready.
*   **Documentation**: [Read the API Guide](./API_DOCUMENTATION.md).

### 3. AI Yield Assistant
*   Chat with our AI to find the best opportunities.
*   "Which stablecoin is safest?" -> The AI calls `analyzeRisk()` tool to check on-chain parameters.
*   "Analyze my position" -> The AI fetches your wallet data.

### 4. Smart Alerts
*   Risk analysis engine that calculates safety scores (0-100).
*   Visual indicators for high-risk assets.

## 🛠️ Tech Stack & Architecture

*   **Frontend**: Next.js 16 (App Router), Tailwind CSS, Lucide Icons.
*   **Backend**: Next.js API Routes (Serverless).
*   **Blockchain**: Thirdweb SDK, Aave V3 SDK.
*   **Database**: Upstash Redis (Caching), Supabase (Historical Data).
*   **AI**: Vercel AI SDK, Thirdweb Nebula.

## 🏁 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd yieldx
pnpm install
```

### 2. Environment Setup
Create `.env.local` using the provided example. You will need:
- Thirdweb Client ID
- Upstash Redis Credentials (for caching)

### 3. Run Locally
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

---
*Built for the Hackathon 2026. Production Ready.*
