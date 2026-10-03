import { Router } from "express";

import {
  getQuote,
  getHistoricalCandles,
  getMarketIndicators,
  connectLiveMarketData,
} from "../controllers/marketData.controller.js";

const router = Router();

router.get("/quote", getQuote);

router.get("/historical", getHistoricalCandles);

router.get("/indicators", getMarketIndicators);

router.get("/live/connect", connectLiveMarketData);

export default router;
