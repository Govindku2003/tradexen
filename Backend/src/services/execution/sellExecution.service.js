import { validateOrder } from "./orderValidation.service.js";

const executeSellOrder = ({
  availableQuantity,
  order,
}) => {
  const validation = validateOrder(order);

  if (!validation.valid) {
    return {
      executed: false,
      reason: validation.reason,
    };
  }

  if (order.side !== "SELL") {
    return {
      executed: false,
      reason: "Order side must be SELL",
    };
  }

  if (order.quantity > availableQuantity) {
    return {
      executed: false,
      reason: "Insufficient position quantity",
    };
  }

  const orderValue =
    order.price * order.quantity;

  const remainingQuantity =
    availableQuantity - order.quantity;

  return {
    executed: true,
    mode: "PAPER",
    order,
    orderValue,
    previousQuantity: availableQuantity,
    remainingQuantity,
    executedAt: new Date().toISOString(),
  };
};

export { executeSellOrder };