# YieldX API Documentation

> **Real-time DeFi yield data for Aave V3 on Ethereum**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-repo/yieldx)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://yieldx.vercel.app/api/health)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📚 Table of Contents

- [Getting Started](#getting-started)
- [REST API Endpoints](#rest-api-endpoints)
- [WebSocket API](#websocket-api)
- [Rate Limiting](#rate-limiting)
- [Code Examples](#code-examples)

---

## 🚀 Getting Started

**Base URL:** `https://yieldx.vercel.app`

**Quick test:**
```bash
curl https://yieldx.vercel.app/api/health
```

### Data Sources

| Source | Latency | Freshness | Use Case |
|--------|---------|-----------|----------|
| **Redis Cache** | ~5-10ms | <500ms | Default - instant responses |
| **RPC (Direct)** | ~2-5s | Real-time | Fallback if cache unavailable |
| **WebSocket** | Push | Real-time | Live updates on blockchain events |

---

## 📡 REST API Endpoints

### 1. Health Check
`GET /api/health`
Check system status and uptime.

### 2. List All Assets
`GET /api/assets`
Get metadata for all tracked assets.

### 3. Get All Yields
`GET /api/yields`
Get real-time APY data for all Aave V3 assets.

**Response:**
```json
{
  "success": true,
  "assetCount": 60,
  "latencyMs": 8,
  "assets": [
    {
      "symbol": "USDC",
      "supplyAPY": 3.88,
      "borrowAPY": 4.84,
      "utilizationRate": 89.12
    }
  ]
}
```

### 4. Get Best Yield
`GET /api/yields/best?category=Stablecoin`
Find the highest-yielding asset.

### 5. Compare Yields
`GET /api/yields/compare?symbols=USDC,USDT,DAI`
Compare yields across multiple assets side-by-side.

---

## 🔌 WebSocket API

Real-time updates via Supabase Realtime channels.

**Channel:** `yields`
**Events:** `update`, `asset_update`

---

## ⚡ Rate Limiting

| Tier | Requests/Minute |
|------|----------------|
| **Free** | 100 |

---

## 💻 Code Examples

### JavaScript (fetch)

```javascript
const response = await fetch('https://yieldx.vercel.app/api/yields');
const data = await response.json();

console.log(`Found ${data.assetCount} assets`);
data.assets.forEach(asset => {
  console.log(`${asset.symbol}: ${asset.supplyAPY}% APY`);
});
```

### Python

```python
import requests
response = requests.get('https://yieldx.vercel.app/api/yields')
data = response.json()
print(data['assets'][0])
```

---

**Built with ❤️ for the DeFi community**
