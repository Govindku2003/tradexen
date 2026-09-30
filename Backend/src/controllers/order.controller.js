import TradingAccount from "../models/TradingAccount.js";

import {
  createOrder,
  getOrderById,
  getOrderHistory,
} from "../services/orders/order.service.js";

import { executeOrder } from "../services/orders/order.execution.service.js";
import { cancelOrder } from "../services/orders/order.cancellation.service.js";

const getUserTradingAccount = async (userId) => {
  const tradingAccount = await TradingAccount.findOne({
    user: userId,
    status: "active",
  });

  if (!tradingAccount) {
    throw new Error("Active trading account not found");
  }

  return tradingAccount;
};

const createOrderController = async (req, res) => {
  try {
    const {
      symbol,
      side,
      orderType = "MARKET",
      quantity,
      requestedPrice,
      stopLoss,
      takeProfit,
      source = "MANUAL",
      strategy = null,
    } = req.body;

    // Resolve account from authenticated user
    const tradingAccount = await getUserTradingAccount(
      req.userId,
    );

    // Only MANUAL and BOT orders are allowed
    if (!["MANUAL", "BOT"].includes(source)) {
      return res.status(400).json({
        success: false,
        message: "Order source must be MANUAL or BOT",
      });
    }

    const order = await createOrder({
      userId: req.userId,
      tradingAccountId: tradingAccount._id,
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
        tradingAccount: {
          id: tradingAccount._id,
          accountType: tradingAccount.accountType,
          availableBalance: tradingAccount.availableBalance,
          investedAmount: tradingAccount.investedAmount,
          currency: tradingAccount.currency,
          status: tradingAccount.status,
        },
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
    const order = await getOrderById(
      req.params.orderId,
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent access to another user's order
    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this order",
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
      status,
      limit = 20,
      skip = 0,
    } = req.query;

    const tradingAccount =
      await getUserTradingAccount(req.userId);

    const result = await getOrderHistory({
      userId: req.userId,
      tradingAccountId: tradingAccount._id,
      status,
      limit: Number(limit),
      skip: Number(skip),
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        tradingAccount: {
          id: tradingAccount._id,
          accountType: tradingAccount.accountType,
          availableBalance: tradingAccount.availableBalance,
          investedAmount: tradingAccount.investedAmount,
          currency: tradingAccount.currency,
          status: tradingAccount.status,
        },
      },
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
    const order = await getOrderById(
      req.params.orderId,
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent executing another user's order
    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to execute this order",
      });
    }

    const result = await executeOrder(
      req.params.orderId,
    );

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
    const order = await getOrderById(
      req.params.orderId,
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prevent cancelling another user's order
    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    const cancelledOrder = await cancelOrder(
      req.params.orderId,
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order: cancelledOrder,
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