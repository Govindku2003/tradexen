import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import env from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import dbHealthRoutes from "./routes/dbHealth.routes.js";

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
  })
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