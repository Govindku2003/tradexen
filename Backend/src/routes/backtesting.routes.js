import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  runBacktestController,
  getBacktestHistoryController,
  getBacktestController,
} from "../controllers/backtesting.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| Run Backtest
|--------------------------------------------------------------------------
*/

router.post("/run", runBacktestController);

/*
|--------------------------------------------------------------------------
| Backtest History
|--------------------------------------------------------------------------
*/

router.get("/", getBacktestHistoryController);

/*
|--------------------------------------------------------------------------
| Single Backtest
|--------------------------------------------------------------------------
*/

router.get("/:backtestId", getBacktestController);

export default router;
