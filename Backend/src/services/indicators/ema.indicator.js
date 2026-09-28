const calculateEMA = (prices, period) => {
  if (!Array.isArray(prices)) {
    throw new Error("Prices must be an array");
  }

  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Period must be a positive integer");
  }

  if (prices.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);

  // Initial EMA starts with SMA
  let ema =
    prices
      .slice(0, period)
      .reduce((sum, price) => sum + price, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema =
      (prices[i] - ema) * multiplier + ema;
  }

  return ema;
};

export { calculateEMA };