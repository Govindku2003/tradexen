const calculateRSI = (prices, period = 14) => {
  if (!Array.isArray(prices)) {
    throw new Error("Prices must be an array");
  }

  if (!Number.isInteger(period) || period <= 0) {
    throw new Error("Period must be a positive integer");
  }

  if (prices.length <= period) {
    return null;
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];

    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let averageGain = gains / period;
  let averageLoss = losses / period;

  // Wilder's smoothing
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];

    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    averageGain =
      (averageGain * (period - 1) + currentGain) / period;

    averageLoss =
      (averageLoss * (period - 1) + currentLoss) / period;
  }

  // If there are no losses, RSI is 100
  if (averageLoss === 0) {
    return 100;
  }

  const relativeStrength = averageGain / averageLoss;

  const rsi =
    100 - 100 / (1 + relativeStrength);

  return rsi;
};

export { calculateRSI };