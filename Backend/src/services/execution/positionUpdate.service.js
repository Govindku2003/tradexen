const createOrUpdatePosition = ({
  existingPosition = null,
  side,
  quantity,
  price,
}) => {
  if (!["BUY", "SELL"].includes(side)) {
    throw new Error("Side must be BUY or SELL");
  }

  if (quantity <= 0 || price <= 0) {
    throw new Error(
      "Quantity and price must be positive"
    );
  }

  if (side === "BUY") {
    if (!existingPosition) {
      return {
        symbol: null,
        quantity,
        averagePrice: price,
        status: "OPEN",
      };
    }

    const totalQuantity =
      existingPosition.quantity + quantity;

    const totalValue =
      existingPosition.quantity *
        existingPosition.averagePrice +
      quantity * price;

    return {
      symbol: existingPosition.symbol,
      quantity: totalQuantity,
      averagePrice:
        totalValue / totalQuantity,
      status: "OPEN",
    };
  }

  if (!existingPosition) {
    throw new Error(
      "Cannot SELL without an existing position"
    );
  }

  if (quantity > existingPosition.quantity) {
    throw new Error(
      "Cannot SELL more than available position quantity"
    );
  }

  const remainingQuantity =
    existingPosition.quantity - quantity;

  return {
    symbol: existingPosition.symbol,
    quantity: remainingQuantity,
    averagePrice: existingPosition.averagePrice,
    status:
      remainingQuantity === 0
        ? "CLOSED"
        : "OPEN",
  };
};

export { createOrUpdatePosition };