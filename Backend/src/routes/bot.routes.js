import { Router } from "express";

import protect from "../middleware/auth.middleware.js";

import {
  listBots,
  getBot,
  createBotController,
  updateBotController,
  startBotController,
  pauseBotController,
  stopBotController,
  deleteBotController,
  getBotSignalsController,
} from "../controllers/bot.controller.js";

const router = Router();

router.use(protect);

router.get("/", listBots);

router.post(
  "/",
  createBotController,
);

router.get(
  "/:botId",
  getBot,
);

router.patch(
  "/:botId",
  updateBotController,
);

router.post(
  "/:botId/start",
  startBotController,
);

router.post(
  "/:botId/pause",
  pauseBotController,
);

router.post(
  "/:botId/stop",
  stopBotController,
);

router.delete(
  "/:botId",
  deleteBotController,
);

router.get(
  "/:botId/signals",
  getBotSignalsController,
);

export default router;