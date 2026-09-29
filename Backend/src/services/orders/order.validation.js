const validateOrderData = (order) => {
  if (!order) {
    return {
      valid: false,
      reason: "Order data is required",
    };
  }

  if (!order.symbol) {
    return {
      valid: false,
      reason: "Symbol is required",
    };
  }

  if (!["BUY", "SELL"].includes(order.side)) {
    return {
      valid: false,
      reason: "Side must be BUY or SELL",
    };
  }

  if (!Number.isInteger(order.quantity) || order.quantity <= 0) {
    return {
      valid: false,
      reason: "Quantity must be a positive integer",
    };
  }

  if (typeof order.price !== "number" || order.price <= 0) {
    return {
      valid: false,
      reason: "Price must be positive",
    };
  }

  return {
    valid: true,
    reason: "Order data is valid",
  };
};

export { validateOrderData };