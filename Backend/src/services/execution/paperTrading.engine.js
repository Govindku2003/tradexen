import { executeBuyOrder } from "./buyExecution.service.js";
import { executeSellOrder } from "./sellExecution.service.js";
import {
  updateBalanceAfterBuy,
  updateBalanceAfterSell,
} from "./balanceUpdate.service.js";
import { createOrUpdatePosition } from "./positionUpdate.service.js";
import { createTradeRecord } from "./tradeRecord.service.js";

const executePaperTrade = ({
  account,
  position = null,
  order,
  strategy = null,
  signal = null,
}) => {
  if (!account) {
    throw new Error("Trading account is required");
  }

  if (!order) {
    throw new Error("Order is required");
  }

  if (order.side === "BUY") {
    const execution = executeBuyOrder({
      availableBalance: account.availableBalance,
      order,
    });

    if (!execution.executed) {
      return execution;
    }

    const balance = updateBalanceAfterBuy({
      availableBalance: account.availableBalance,
      orderValue: execution.orderValue,
    });

    const updatedPosition =
      createOrUpdatePosition({
        existingPosition: position,
        side: "BUY",
        quantity: order.quantity,
        price: order.price,
      });

    updatedPosition.symbol = order.symbol;

    const trade = createTradeRecord({
      order,
      strategy,
      signal,
    });

    return {
      executed: true,
      execution,
      balance,
      position: updatedPosition,
      trade,
    };
  }

  if (order.side === "SELL") {
    const execution = executeSellOrder({
      availableQuantity: position?.quantity ?? 0,
      order,
    });

    if (!execution.executed) {
      return execution;
    }

    const balance = updateBalanceAfterSell({
      availableBalance: account.availableBalance,
      orderValue: execution.orderValue,
    });

    const updatedPosition =
      createOrUpdatePosition({
        existingPosition: position,
        side: "SELL",
        quantity: order.quantity,
        price: order.price,
      });

    const trade = createTradeRecord({
      order,
      strategy,
      signal,
    });

    return {
      executed: true,
      execution,
      balance,
      position: updatedPosition,
      trade,
    };
  }

  throw new Error("Unsupported order side");
};

export { executePaperTrade };