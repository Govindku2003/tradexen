import apiRequest from "./apiClient";

const getTrades = async ({
  symbol = "",
  side = "",
  source = "",
  limit = 50,
  skip = 0,
} = {}) => {
  const params = new URLSearchParams();

  if (symbol) params.set("symbol", symbol);
  if (side) params.set("side", side);
  if (source) params.set("source", source);

  params.set("limit", String(limit));
  params.set("skip", String(skip));

  return apiRequest(`/trades?${params.toString()}`);
};

const getTrade = async (tradeId) => {
  if (!tradeId) {
    throw new Error("Trade ID is required");
  }

  return apiRequest(`/trades/${tradeId}`);
};

export {
  getTrades,
  getTrade,
};