import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  getStrategySignals,
  listStrategies,
  createStrategyController,
  updateStrategyController,
  deleteStrategyController,
  toggleStrategyController,
} from "../controllers/strategy.controller.js";

const router = Router();

router.use(protect);

router.get("/signals", getStrategySignals);

router.get("/", listStrategies);

router.post(
  "/",
  createStrategyController,
);

router.patch(
  "/:strategyId",
  updateStrategyController,
);

router.delete(
  "/:strategyId",
  deleteStrategyController,
);

router.patch(
  "/:strategyId/toggle",
  toggleStrategyController,
);

export default router;