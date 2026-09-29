import Order from "../../models/Order.js";
import TradingAccount from "../../models/TradingAccount.js";

import { executePaperTrade } from "../execution/paperTrading.engine.js";

import { updateOrderStatus } from "./order.service.js";
import { ORDER_STATUS } from "./order.status.js";

import {
  getOpenPosition,
  createPosition,
  updatePositionAfterBuy,
  closeOrReducePosition,
} from "../positions/position.service.js";

const executeOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new Error(`Order cannot be executed from status: ${order.status}`);
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

  // Update trading account balance
  account.availableBalance = result.balance.newBalance;
  await account.save();

  const executedPrice = order.requestedPrice;

  // --------------------------------------------------
  // POSITION INTEGRATION
  // --------------------------------------------------

  let position;

  const existingPosition = await getOpenPosition({
    userId: order.user,
    tradingAccountId: order.tradingAccount,
    symbol: order.symbol,
  });

  if (order.side === "BUY") {
    if (existingPosition) {
      // Add quantity to existing LONG position
      position = await updatePositionAfterBuy({
        positionId: existingPosition._id,
        quantity: order.quantity,
        entryPrice: executedPrice,
      });
    } else {
      // Create new LONG position
      position = await createPosition({
        userId: order.user,
        tradingAccountId: order.tradingAccount,
        symbol: order.symbol,
        side: "LONG",
        quantity: order.quantity,
        entryPrice: executedPrice,
        currentPrice: executedPrice,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
      });
    }
  }

  if (order.side === "SELL") {
    if (!existingPosition) {
      throw new Error(`No open position exists for ${order.symbol}`);
    }

    // Reduce or close existing position
    const positionResult = await closeOrReducePosition({
      positionId: existingPosition._id,
      quantity: order.quantity,
      exitPrice: executedPrice,
    });

    position = positionResult.position;
  }

  // --------------------------------------------------
  // ORDER UPDATE
  // --------------------------------------------------

  order.executedPrice = executedPrice;
  order.status = ORDER_STATUS.FILLED;
  order.executedAt = new Date();

  await order.save();

  return {
    order,
    execution: result.execution,
    balance: result.balance,
    position,
    trade: result.trade,
  };
};

export { executeOrder };
