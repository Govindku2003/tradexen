import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  createAccount,
  getAccount,
  syncAccount,
} from "../controllers/tradingAccount.controller.js";

const router = Router();

router.post("/", protect, createAccount);

router.get("/", protect, getAccount);

router.post("/sync", protect, syncAccount);

export default router;
