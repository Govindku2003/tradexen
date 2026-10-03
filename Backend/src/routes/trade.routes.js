import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  getTradeHistoryController,
  getTradeController,
} from "../controllers/trade.controller.js";

const router = Router();

router.use(protect);

router.get(
  "/",
  getTradeHistoryController,
);

router.get(
  "/:tradeId",
  getTradeController,
);

export default router;