import Order from "../../models/Order.js";
import Trade from "../../models/Trade.js";
import TradingAccount from "../../models/TradingAccount.js";

import { executePaperTrade } from "../execution/paperTrading.engine.js";

import { createTradeRecord } from "../execution/tradeRecord.service.js";

import { getTodayRealizedPnL } from "../risk/dailyLoss.service.js";

import { ORDER_STATUS } from "./order.status.js";

import riskManager from "../risk/risk.manager.js";

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
  // 2. FIND ACTIVE TRADING ACCOUNT
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

  const executionPrice = Number(order.requestedPrice);
  console.log("DEBUG requestedPrice:", order.requestedPrice);
  console.log("DEBUG executionPrice:", executionPrice);

  if (!Number.isFinite(executionPrice) || executionPrice <= 0) {
    order.status = ORDER_STATUS.REJECTED;
    await order.save();

    throw new Error("Valid execution price is required");
  }
  // --------------------------------------------------
  // 4. FIND EXISTING POSITION
  // --------------------------------------------------

  const existingPosition = await getOpenPosition({
    userId: order.user,
    tradingAccountId: order.tradingAccount,
    symbol: order.symbol,
  });

  // --------------------------------------------------
  // 5. VALIDATE SELL QUANTITY BEFORE RISK/EXECUTION
  // --------------------------------------------------

  if (order.side === "SELL") {
    if (!existingPosition) {
      order.status = ORDER_STATUS.REJECTED;
      await order.save();

      throw new Error(`No open position exists for ${order.symbol}`);
    }

    if (order.quantity > existingPosition.quantity) {
      order.status = ORDER_STATUS.REJECTED;
      await order.save();

      throw new Error(`Insufficient position quantity for ${order.symbol}`);
    }
  }

  // --------------------------------------------------
  // 6. PROPOSED EXPOSURE
  // --------------------------------------------------

  const proposedExposure =
    order.side === "BUY" ? executionPrice * order.quantity : 0;

  // --------------------------------------------------
  // 7. TODAY'S REALIZED P&L / DAILY LOSS
  // --------------------------------------------------

  const dailyPnL = await getTodayRealizedPnL({
    tradingAccountId: account._id,
  });

  // --------------------------------------------------
  // 8. RISK MANAGEMENT
  // --------------------------------------------------

  const riskResult = riskManager.evaluateTrade({
    accountBalance: account.availableBalance,

    entryPrice: executionPrice,

    riskPercentage: 0.02,

    riskRewardRatio: 2,

    investedAmount: account.investedAmount || 0,

    proposedExposure,

    maxExposurePercentage: 1,

    dailyLoss: dailyPnL.dailyLoss,

    side: order.side,
  });

  if (!riskResult.allowed) {
    order.status = ORDER_STATUS.REJECTED;
    await order.save();

    throw new Error(`Risk check rejected order: ${riskResult.reason}`);
  }

  // --------------------------------------------------
  // 9. PREPARE PAPER EXECUTION ORDER
  // --------------------------------------------------

  const executionOrder = {
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price: executionPrice,
  };

  // --------------------------------------------------
  // 10. PAPER EXECUTION
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
  // 11. EXECUTION FAILED
  // --------------------------------------------------

  if (!result.executed) {
    order.status = ORDER_STATUS.REJECTED;
    await order.save();

    throw new Error(result.reason || "Paper trade execution failed");
  }

  // --------------------------------------------------
  // 12. CALCULATE REALIZED P&L
  // --------------------------------------------------

  let realizedPnL = 0;

  if (order.side === "SELL" && existingPosition) {
    realizedPnL =
      (executionPrice - existingPosition.averageEntryPrice) * order.quantity;
  }

  // --------------------------------------------------
  // 13. UPDATE ACCOUNT BALANCE
  // --------------------------------------------------

  account.availableBalance = result.balance.newBalance;

  // --------------------------------------------------
  // 14. UPDATE POSITION
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
    const positionResult = await closeOrReducePosition({
      positionId: existingPosition._id,
      quantity: order.quantity,
      exitPrice: executionPrice,
    });

    position = positionResult.position;
  }

  // --------------------------------------------------
  // 15. RECALCULATE INVESTED AMOUNT
  // --------------------------------------------------

  account.investedAmount = await calculateInvestedAmount({
    userId: order.user,
    tradingAccountId: order.tradingAccount,
  });

  await account.save();

  // --------------------------------------------------
  // 16. UPDATE ORDER
  // --------------------------------------------------

  order.executedPrice = executionPrice;

  order.status = ORDER_STATUS.FILLED;

  order.executedAt = new Date();

  await order.save();

  // --------------------------------------------------
  // 17. CREATE TRADE RECORD
  // --------------------------------------------------

  const tradeData = createTradeRecord({
    order,
    executionPrice,
    realizedPnL,
    strategy: order.strategy || null,
    signal: null,
  });

  const trade = await Trade.create(tradeData);

  // --------------------------------------------------
  // 18. RETURN FINAL RESULT
  // --------------------------------------------------

  return {
    order,

    execution: result.execution,

    balance: result.balance,

    position,

    trade,

    realizedPnL,

    dailyLoss: dailyPnL.dailyLoss,

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
