const createTradeRecord = ({
  order,
  strategy = null,
  signal = null,
}) => {
  if (!order) {
    throw new Error("Order data is required");
  }

  const orderValue =
    order.price * order.quantity;

  return {
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    price: order.price,
    orderValue,
    mode: "PAPER",
    strategy,
    signal,
    executedAt: new Date().toISOString(),
  };
};

export { createTradeRecord };