# 🚀 TradeXen — Trading Platform & Paper Trading Bot

TradeXen is a full-stack trading platform designed to simulate a real-world trading terminal with live market data, paper trading, automated trading bots, technical indicators, order management, portfolio tracking, and backtesting.

The project is built with a modern React + Node.js + MongoDB architecture and is deployed using Vercel and Render.

---

## 🌐 Live Demo

🚀 **Live Application:** https://tradexen.vercel.app

🔗 **Backend API:** https://tradexen.onrender.com

💻 **GitHub Repository:** https://github.com/Govindku2003/tradexen

---

## 📌 Project Overview

TradeXen provides a trading-terminal-style experience where users can:

- Create an account and log in
- Manage their paper trading account
- View live market prices
- View historical candlestick charts
- Analyze technical indicators
- Place BUY and SELL paper orders
- Track open positions
- View portfolio and P&L
- Monitor order and trade history
- Create and control trading bots
- Run automated paper trading strategies
- Run historical backtests
- Monitor bot signals and execution
- Receive trading/system alerts

The main goal is to build a realistic trading platform architecture while keeping trading execution in a paper-trading environment.

---

# ✨ Key Features

## 🔐 Authentication

- User registration
- User login
- JWT authentication
- Protected API routes
- Authenticated frontend requests
- Persistent login using local storage

---

## 💰 Paper Trading

TradeXen includes a complete paper trading engine.

### Supported operations

- BUY orders
- SELL orders
- MARKET orders
- Order validation
- Risk validation
- Balance management
- Position creation
- Position updates
- Position reduction
- Position closing
- Realized P&L calculation
- Trade record generation

The system simulates trading using a virtual trading account.

---

## 📊 Trading Terminal

The application provides a trading-terminal-style interface containing:

- Market ticker
- Watchlist
- Symbol search
- Live prices
- Candlestick charts
- Order ticket
- BUY / SELL controls
- Quantity selection
- Market order selection
- Portfolio information
- Live WebSocket status

---

# 📈 Live Market Data

TradeXen integrates market data using Upstox APIs.

### Market data functionality

- Live market quotes
- Historical candles
- Market data normalization
- Live WebSocket market updates
- Symbol/instrument mapping
- Historical data for charting
- Technical indicator calculations

---

## 🕯️ Historical Candlestick Charts

The terminal supports historical market charts with:

- Open price
- High price
- Low price
- Close price
- Volume
- Candlestick visualization

Historical data is fetched from the backend and displayed through the React trading terminal.

The application also handles non-trading days such as weekends by using the latest available market date.

---

# 📐 Technical Indicators

TradeXen currently supports:

- SMA
- EMA
- RSI
- MACD

### Default configuration

| Indicator | Default |
|---|---:|
| SMA | 20 |
| EMA | 20 |
| RSI | 14 |
| MACD Fast | 12 |
| MACD Slow | 26 |
| MACD Signal | 9 |

Indicators are calculated on the backend and returned to the frontend along with historical candle data.

---

# 🧾 Order Management

The order system supports:

- Order creation
- Order execution
- Order cancellation
- Order status tracking
- Order history
- Manual orders
- Bot-generated orders

### Order statuses

- PENDING
- OPEN
- FILLED
- PARTIALLY_FILLED
- CANCELLED
- REJECTED

Each order maintains information such as:

- Symbol
- Exchange
- Side
- Quantity
- Requested price
- Executed price
- Stop loss
- Take profit
- Source
- Strategy
- Bot
- Execution time

---

# 📦 Position Management

TradeXen maintains trading positions after order execution.

Position functionality includes:

- Open positions
- Position quantity
- Average entry price
- Invested amount
- Position reduction
- Position closing
- Realized P&L
- Unrealized P&L
- Position history

The system also supports weighted average entry price calculation when additional BUY orders are executed.

---

# 💼 Portfolio Management

The portfolio module provides:

- Available balance
- Invested amount
- Open positions
- Portfolio value
- Realized P&L
- Unrealized P&L
- Trading account information

---

# 🤖 Trading Bot Control Center

TradeXen includes a Bot Control Center for automated paper trading.

Bots can be configured with:

- Symbol
- Instrument key
- Strategy
- Quantity
- Timeframe
- Trading mode
- Stop loss
- Take profit
- Maximum position size
- Daily loss limit
- BUY permission
- SELL permission
- Auto execution

### Bot modes

#### SIGNAL Mode

The bot analyzes market conditions and generates trading signals.

#### AUTO Mode

The bot can generate and execute paper orders based on the configured strategy and risk settings.

---

# 🧠 Strategy Engine

TradeXen supports strategy-based signal generation.

Current strategy types include:

- EMA Crossover
- RSI
- MACD

The strategy engine receives market data, calculates indicators, evaluates strategy conditions, and generates:

- BUY
- SELL
- HOLD

signals.

---

# 🔄 Bot Execution Flow

```text
Market Data
     ↓
Historical / Live Price
     ↓
Indicator Calculation
     ↓
Strategy Engine
     ↓
BUY / SELL / HOLD Signal
     ↓
Risk Validation
     ↓
Bot Decision
     ↓
Paper Order Creation
     ↓
Paper Order Execution
     ↓
Position Update
     ↓
Trade Record
     ↓
P&L Update
