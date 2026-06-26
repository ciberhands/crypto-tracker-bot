# Crypto Tracker Bot 🚀

A lightweight CLI bot that fetches and displays live cryptocurrency prices with alerts, history tracking, and scheduling.

## Features
✨ **15+ Cryptocurrencies** — Bitcoin, Ethereum, Cardano, Solana, Polkadot, Ripple, Litecoin, Dogecoin, Tron, Chainlink, Uniswap, Avalanche, Polygon, Optimism, Arbitrum

🔄 **Auto-Scheduling** — Fetches prices every 5 minutes automatically

🚨 **Price Alerts** — Set custom alerts when prices go above/below targets

💾 **Price History** — Saves all data to CSV for tracking trends

📊 **Real-time Display** — Shows prices, 24h changes, and market caps

## Installation

```bash
npm install
```

## Usage

**Start continuous tracking (updates every 5 minutes):**
```bash
npm start
```

**Set price alerts:**
```bash
node index.js alert-above bitcoin 60000
node index.js alert-below ethereum 1500
```

**View price history:**
```bash
node index.js show-history bitcoin
```

**List all tracked cryptos:**
```bash
node index.js list-cryptos
```

**Show help:**
```bash
node index.js help
```

## Output Examples

### Live Prices
```
🚀 Fetching crypto prices...

┌──────────┬─────────────┬────────────┬─────────────┐
│ BITCOIN  │ $59,408.00  │ -2.26%     │ $1191.15B   │
│ ETHEREUM │ $1,558.78   │ -3.58%     │ $188.11B    │
└──────────┴─────────────┴────────────┴─────────────┘

🚨 ALERT: BITCOIN hit $60,000 (target: $60,000)
```

### Price History
```
📊 Price history for BITCOIN:
  1. $58,900.00 at 2024-01-15T14:23:45.123Z
  2. $59,100.00 at 2024-01-15T14:28:45.456Z
  3. $59,408.00 at 2024-01-15T14:33:45.789Z
```

## Data Files

- `crypto_history.csv` — All historical prices
- `alerts.json` — Your active price alerts

## Customization

Edit `index.js` to add more cryptocurrencies or change the update interval:

```javascript
const cryptos = ['bitcoin', 'ethereum', 'your-coin-here'];
const updateInterval = 5 * 60 * 1000; // Change to your preferred interval
```

## Future Ideas
- Real-time notifications (Discord/Telegram)
- Export charts as images
- Connect to trading APIs
- Add watchlists
- Create web dashboard
