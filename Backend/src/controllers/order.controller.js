import {
  createOrder,
  getOrderById,
  getOrderHistory,
} from "../services/orders/order.service.js";

import { executeOrder } from "../services/orders/order.execution.service.js";
import { cancelOrder } from "../services/orders/order.cancellation.service.js";


const createOrderController = async (req, res) => {
  try {
    const {
      tradingAccountId,
      symbol,
      side,
      orderType,
      quantity,
      requestedPrice,
      stopLoss,
      takeProfit,
      source,
      strategy,
    } = req.body;

    const order = await createOrder({
      userId: req.userId,
      tradingAccountId,
      symbol,
      side,
      orderType,
      quantity,
      requestedPrice,
      stopLoss,
      takeProfit,
      source,
      strategy,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOrderController = async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
};

const getOrderHistoryController = async (req, res) => {
  try {
    const {
      tradingAccountId,
      status,
      limit = 20,
      skip = 0,
    } = req.query;

    const result = await getOrderHistory({
      userId: req.userId,
      tradingAccountId,
      status,
      limit: Number(limit),
      skip: Number(skip),
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get order history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order history",
    });
  }
};
const executeOrderController = async (req, res) => {
  try {
    const result = await executeOrder(req.params.orderId);

    return res.status(200).json({
      success: true,
      message: "Order executed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Execute order error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelOrderController = async (req, res) => {
  try {
    const order = await cancelOrder(req.params.orderId);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createOrderController,
  getOrderController,
  getOrderHistoryController,
   executeOrderController,
  cancelOrderController,
};