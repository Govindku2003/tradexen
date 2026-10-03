import Order from "../../models/Order.js";

import {
  validateOrderData,
} from "./order.validation.js";

import {
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
} from "./order.status.js";

const createOrder = async ({
  userId,
  tradingAccountId,
  symbol,
  side,
  orderType = "MARKET",
  quantity,
  requestedPrice = null,
  stopLoss = null,
  takeProfit = null,
  source = "MANUAL",
  strategy = null,
  bot = null,
}) => {
  const validation = validateOrderData({
    symbol,
    side,
    quantity,
    price: requestedPrice,
  });

  if (!validation.valid) {
    throw new Error(validation.reason);
  }

  if (!tradingAccountId) {
    throw new Error("Trading account is required");
  }

  const order = await Order.create({
    user: userId,
    tradingAccount: tradingAccountId,
    symbol,
    exchange: "NSE",
    side,
    orderType,
    quantity,
    requestedPrice,
    executedPrice: null,
    stopLoss,
    takeProfit,
    status: "PENDING",
    source,
    strategy,
    bot,
    executedAt: null,
  });

  return order;
};

const getOrderById = async (orderId) => {
  return Order.findById(orderId)
    .populate("strategy", "name strategyType")
    .populate("bot", "name symbol status");
};

const getOrderHistory = async ({
  userId,
  tradingAccountId = null,
  status = null,
  limit = 20,
  skip = 0,
}) => {
  const query = {
    user: userId,
  };

  if (tradingAccountId) {
    query.tradingAccount = tradingAccountId;
  }

  if (status) {
    query.status = status.toUpperCase();
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    100,
  );

  const safeSkip = Math.max(
    Number(skip) || 0,
    0,
  );

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("strategy", "name strategyType")
      .populate("bot", "name symbol status")
      .sort({ createdAt: -1 })
      .skip(safeSkip)
      .limit(safeLimit)
      .lean(),

    Order.countDocuments(query),
  ]);

  return {
    orders,
    pagination: {
      total,
      limit: safeLimit,
      skip: safeSkip,
      hasMore: safeSkip + orders.length < total,
    },
  };
};

const updateOrderStatus = async (
  orderId,
  newStatus,
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (!Object.values(ORDER_STATUS).includes(newStatus)) {
    throw new Error(
      `Invalid order status: ${newStatus}`,
    );
  }

  const allowedTransitions =
    ORDER_STATUS_TRANSITIONS[order.status] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${order.status} → ${newStatus}`,
    );
  }

  order.status = newStatus;

  if (newStatus === ORDER_STATUS.FILLED) {
    order.executedAt = new Date();
  }

  await order.save();

  return order;
};

export {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getOrderHistory,
};