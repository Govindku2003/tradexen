import { Router } from "express";
import { dbHealthCheck } from "../controllers/dbHealth.controller.js";

const router = Router();

router.get("/", dbHealthCheck);

export default router;