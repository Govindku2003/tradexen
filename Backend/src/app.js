import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import env from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import dbHealthRoutes from "./routes/dbHealth.routes.js";
import authRoutes from "./routes/auth.routes.js";
import tradingAccountRoutes from "./routes/tradingAccount.routes.js";
import marketDataRoutes from "./routes/marketData.routes.js";
import orderRoutes from "./routes/order.routes.js";
import positionRoutes from "./routes/position.routes.js";
import backtestingRoutes from "./routes/backtesting.routes.js";
import strategyRoutes from "./routes/strategy.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";
import botRoutes from "./routes/bot.routes.js";
import tradeRoutes from "./routes/trade.routes.js";

const app = express();

/*
 * Security
 */
app.use(helmet());

/*
 * CORS
 */
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

/*
 * Request logging
 */
app.use(morgan("dev"));

/*
 * Body parsing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
 * API Routes
 */
app.use("/api/health", healthRoutes);
app.use("/api/health/db", dbHealthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trading-account", tradingAccountRoutes);
app.use("/api/market-data", marketDataRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/backtesting", backtestingRoutes);
app.use("/api/strategy", strategyRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/trades", tradeRoutes);
/*
 * Root API
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "TradeXen API",
    message: "TradeXen backend is running",
  });
});

/*
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
