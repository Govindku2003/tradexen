const calculateSMA = (prices, period) => {
  if (!Array.isArray(prices)) {
    throw new Error("Prices must be an array");
  }

  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Period must be a positive integer");
  }

  if (prices.length < period) {
    return null;
  }

  const recentPrices = prices.slice(-period);

  const sum = recentPrices.reduce(
    (total, price) => total + price,
    0
  );

  return sum / period;
};

export { calculateSMA };