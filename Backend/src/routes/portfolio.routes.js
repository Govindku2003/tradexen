import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  getPortfolioController,
} from "../controllers/portfolio.controller.js";

const router = Router();

router.use(protect);

router.get("/", getPortfolioController);

export default router;