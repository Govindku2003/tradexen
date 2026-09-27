import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import {
  createAccount,
  getAccount,
} from "../controllers/tradingAccount.controller.js";

const router = Router();

router.post("/", protect, createAccount);
router.get("/", protect, getAccount);

export default router;