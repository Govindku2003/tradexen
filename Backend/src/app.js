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
