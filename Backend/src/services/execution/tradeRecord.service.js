const createTradeRecord = ({
  order,
  executionPrice,
  realizedPnL = 0,
  strategy = null,
  signal = null,
}) => {
  if (!order) {
    throw new Error("Order data is required");
  }

  const price =
    typeof executionPrice === "number"
      ? executionPrice
      : (order.executedPrice ?? order.requestedPrice ?? order.price);

  if (typeof price !== "number" || price <= 0) {
    throw new Error("Valid execution price is required");
  }

  const quantity = Number(order.quantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Valid trade quantity is required");
  }

  const normalizedPnL = Number(realizedPnL);

  if (!Number.isFinite(normalizedPnL)) {
    throw new Error("Realized P&L must be a valid number");
  }

  return {
    user: order.user,
    tradingAccount: order.tradingAccount,
    order: order._id,

    symbol: order.symbol,
    exchange: order.exchange || "NSE",

    side: order.side,
    quantity,

    executedPrice: price,
    totalValue: price * quantity,

    realizedPnL: normalizedPnL,

    source: order.source || "MANUAL",
    mode: "PAPER",

    strategy,
    signal,

    executedAt: new Date(),
  };
};

export { createTradeRecord };
