import { Router } from "express";
import { getQuote } from "../controllers/marketData.controller.js";

const router = Router();

router.get("/quote", getQuote);

export default router;