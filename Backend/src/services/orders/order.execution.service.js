import Order from "../../models/Order.js";
import TradingAccount from "../../models/TradingAccount.js";
import { executePaperTrade } from "../execution/paperTrading.engine.js";
import { updateOrderStatus } from "./order.service.js";
import { ORDER_STATUS } from "./order.status.js";

const executeOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new Error(
      `Order cannot be executed from status: ${order.status}`
    );
  }

  const account = await TradingAccount.findById(order.tradingAccount);

  if (!account) {
    throw new Error("Trading account not found");
  }

  const executionOrder = {
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price: order.requestedPrice,
  };

  const result = executePaperTrade({
    account: {
      availableBalance: account.availableBalance,
    },
    order: executionOrder,
  });

  if (!result.executed) {
    await updateOrderStatus(orderId, ORDER_STATUS.REJECTED);

    throw new Error(result.reason || "Paper trade execution failed");
  }

  account.availableBalance = result.balance.newBalance;
  await account.save();

  order.executedPrice = order.requestedPrice;
  order.status = ORDER_STATUS.FILLED;
  order.executedAt = new Date();

  await order.save();

  return {
    order,
    execution: result.execution,
    balance: result.balance,
    position: result.position,
    trade: result.trade,
  };
};

export { executeOrder };