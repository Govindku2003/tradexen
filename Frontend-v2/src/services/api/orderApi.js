import apiRequest from "./apiClient";

const createOrder = async ({
  symbol,
  side,
  orderType = "MARKET",
  quantity,
  requestedPrice,
  stopLoss = null,
  takeProfit = null,
  source = "MANUAL",
  strategy = null,
}) => {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      side,
      orderType,
      quantity,
      requestedPrice,
      stopLoss,
      takeProfit,
      source,
      strategy,
    }),
  });
};

const executeOrder = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  return apiRequest(`/orders/${orderId}/execute`, {
    method: "POST",
  });
};

const getOrders = async ({
  status = "",
  limit = 20,
  skip = 0,
} = {}) => {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  params.set("limit", String(limit));
  params.set("skip", String(skip));

  return apiRequest(`/orders?${params.toString()}`);
};

const cancelOrder = async (orderId) => {
  if (!orderId) {
    throw new Error("Order ID is required");
  }

  return apiRequest(`/orders/${orderId}/cancel`, {
    method: "PATCH",
  });
};

export {
  createOrder,
  executeOrder,
  getOrders,
  cancelOrder,
};