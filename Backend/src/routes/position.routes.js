import { Router } from "express";
import protect from "../middleware/auth.middleware.js";

import {
  getPositionController,
  getPositionHistoryController,
} from "../controllers/position.controller.js";

const router = Router();

router.use(protect);

router.get("/", getPositionHistoryController);
router.get("/:positionId", getPositionController);

export default router;