import { validateOrder } from "./orderValidation.service.js";

const executeBuyOrder = ({
  availableBalance,
  order,
}) => {
  const validation = validateOrder(order);

  if (!validation.valid) {
    return {
      executed: false,
      reason: validation.reason,
    };
  }

  if (order.side !== "BUY") {
    return {
      executed: false,
      reason: "Order side must be BUY",
    };
  }

  const orderValue =
    order.price * order.quantity;

  if (orderValue > availableBalance) {
    return {
      executed: false,
      reason: "Insufficient available balance",
    };
  }

  const remainingBalance =
    availableBalance - orderValue;

  return {
    executed: true,
    mode: "PAPER",
    order,
    orderValue,
    previousBalance: availableBalance,
    remainingBalance,
    executedAt: new Date().toISOString(),
  };
};

export { executeBuyOrder };