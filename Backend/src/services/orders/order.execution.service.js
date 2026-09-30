import Order from "../../models/Order.js";
import TradingAccount from "../../models/TradingAccount.js";

import { executePaperTrade } from "../execution/paperTrading.engine.js";

import { ORDER_STATUS } from "./order.status.js";

import {
  getOpenPosition,
  createPosition,
  updatePositionAfterBuy,
  closeOrReducePosition,
  calculateInvestedAmount,
} from "../positions/position.service.js";

const executeOrder = async (orderId) => {
  // --------------------------------------------------
  // 1. FIND ORDER
  // --------------------------------------------------

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new Error(`Order cannot be executed from status: ${order.status}`);
  }

  // --------------------------------------------------
  // 2. FIND USER'S ACTIVE TRADING ACCOUNT
  // --------------------------------------------------

  const account = await TradingAccount.findOne({
    _id: order.tradingAccount,
    user: order.user,
    status: "active",
  });

  if (!account) {
    throw new Error("Active trading account not found");
  }

  // --------------------------------------------------
  // 3. EXECUTION PRICE
  // --------------------------------------------------

  const executionPrice = order.requestedPrice;

  if (typeof executionPrice !== "number" || executionPrice <= 0) {
    order.status = ORDER_STATUS.REJECTED;
    await order.save();

    throw new Error("Valid execution price is required");
  }

  // --------------------------------------------------
  // 4. FIND EXISTING OPEN POSITION
  // --------------------------------------------------

  const existingPosition = await getOpenPosition({
    userId: order.user,
    tradingAccountId: order.tradingAccount,
    symbol: order.symbol,
  });

  // --------------------------------------------------
  // 5. PREPARE PAPER EXECUTION ORDER
  // --------------------------------------------------

  const executionOrder = {
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price: executionPrice,
  };

  // --------------------------------------------------
  // 6. PAPER EXECUTION
  // --------------------------------------------------

  const result = executePaperTrade({
    account: {
      availableBalance: account.availableBalance,
    },
    position: existingPosition
      ? {
          symbol: existingPosition.symbol,
          quantity: existingPosition.quantity,
          averagePrice: existingPosition.averageEntryPrice,
          status: existingPosition.status,
        }
      : null,
    order: executionOrder,
  });

  // --------------------------------------------------
  // 7. EXECUTION FAILED
  // --------------------------------------------------

  if (!result.executed) {
    order.status = ORDER_STATUS.REJECTED;
    await order.save();

    throw new Error(result.reason || "Paper trade execution failed");
  }

  // --------------------------------------------------
  // 8. UPDATE ACCOUNT BALANCE
  // --------------------------------------------------

  account.availableBalance = result.balance.newBalance;

  // --------------------------------------------------
  // 9. UPDATE POSITION DATABASE
  // --------------------------------------------------

  let position;

  if (order.side === "BUY") {
    if (existingPosition) {
      position = await updatePositionAfterBuy({
        positionId: existingPosition._id,
        quantity: order.quantity,
        entryPrice: executionPrice,
      });
    } else {
      position = await createPosition({
        userId: order.user,
        tradingAccountId: order.tradingAccount,
        symbol: order.symbol,
        side: "LONG",
        quantity: order.quantity,
        entryPrice: executionPrice,
        currentPrice: executionPrice,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
      });
    }
  }

  if (order.side === "SELL") {
    if (!existingPosition) {
      throw new Error(`No open position exists for ${order.symbol}`);
    }

    const positionResult = await closeOrReducePosition({
      positionId: existingPosition._id,
      quantity: order.quantity,
      exitPrice: executionPrice,
    });

    position = positionResult.position;
  }

  // --------------------------------------------------
  // 10. RECALCULATE INVESTED AMOUNT
  // --------------------------------------------------
  // Invested amount represents the current cost basis
  // of open positions.

  account.investedAmount = await calculateInvestedAmount({
    userId: order.user,
    tradingAccountId: order.tradingAccount,
  });

  await account.save();

  // --------------------------------------------------
  // 11. UPDATE ORDER
  // --------------------------------------------------

  order.executedPrice = executionPrice;
  order.status = ORDER_STATUS.FILLED;
  order.executedAt = new Date();

  await order.save();

  // --------------------------------------------------
  // 12. RETURN RESULT
  // --------------------------------------------------

  return {
    order,
    execution: result.execution,
    balance: result.balance,
    position,
    trade: result.trade,
    tradingAccount: {
      id: account._id,
      availableBalance: account.availableBalance,
      investedAmount: account.investedAmount,
      currency: account.currency,
      status: account.status,
    },
  };
};

export { executeOrder };
