import apiRequest from "./apiClient";

const runBacktest = async (payload) => {
  const response = await apiRequest("/backtesting/run", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response?.data;
};

const getBacktests = async ({
  limit = 20,
  skip = 0,
} = {}) => {
  const params = new URLSearchParams();

  params.set("limit", String(limit));
  params.set("skip", String(skip));

  return apiRequest(`/backtesting?${params.toString()}`);
};

const getBacktest = async (backtestId) => {
  if (!backtestId) {
    throw new Error("Backtest ID is required");
  }

  return apiRequest(`/backtesting/${backtestId}`);
};

export {
  runBacktest,
  getBacktests,
  getBacktest,
};