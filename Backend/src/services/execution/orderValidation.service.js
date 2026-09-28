const validateOrder = (order) => {
  if (!order) {
    return {
      valid: false,
      reason: "Order data is required",
    };
  }

  if (!order.symbol || typeof order.symbol !== "string") {
    return {
      valid: false,
      reason: "Valid symbol is required",
    };
  }

  if (!["BUY", "SELL"].includes(order.side)) {
    return {
      valid: false,
      reason: "Order side must be BUY or SELL",
    };
  }

  if (
    !Number.isInteger(order.quantity) ||
    order.quantity <= 0
  ) {
    return {
      valid: false,
      reason: "Quantity must be a positive integer",
    };
  }

  if (
    typeof order.price !== "number" ||
    order.price <= 0
  ) {
    return {
      valid: false,
      reason: "Price must be a positive number",
    };
  }

  return {
    valid: true,
    reason: "Order validation successful",
  };
};

export { validateOrder };