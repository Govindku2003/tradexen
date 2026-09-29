import { Router } from "express";
import protect from "../middleware/auth.middleware.js";

import {
  createOrderController,
  getOrderController,
  getOrderHistoryController,
   executeOrderController,
  cancelOrderController,
} from "../controllers/order.controller.js";

const router = Router();

router.use(protect);

// Create order
router.post("/", createOrderController);

// Order history
router.get("/", getOrderHistoryController);

// Single order
router.get("/:orderId", getOrderController);

router.post("/:orderId/execute", executeOrderController);

router.patch("/:orderId/cancel", cancelOrderController);

export default router;