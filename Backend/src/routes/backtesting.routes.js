import { Router } from "express";

import {
  runBacktestController,
} from "../controllers/backtesting.controller.js";

const router = Router();

router.post(
  "/run",
  runBacktestController
);

export default router;