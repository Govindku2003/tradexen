import Order from "../../models/Order.js";
import { ORDER_STATUS } from "./order.status.js";
import { updateOrderStatus } from "./order.service.js";

const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (
    order.status !== ORDER_STATUS.PENDING &&
    order.status !== ORDER_STATUS.OPEN &&
    order.status !== ORDER_STATUS.PARTIALLY_FILLED
  ) {
    throw new Error(
      `Order cannot be cancelled from status: ${order.status}`
    );
  }

  const cancelledOrder = await updateOrderStatus(
    orderId,
    ORDER_STATUS.CANCELLED
  );

  return cancelledOrder;
};

export { cancelOrder };