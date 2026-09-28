const calculateEMA = (values, period) => {
  if (values.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);

  let ema =
    values
      .slice(0, period)
      .reduce((sum, value) => sum + value, 0) / period;

  for (let i = period; i < values.length; i++) {
    ema =
      (values[i] - ema) * multiplier + ema;
  }

  return ema;
};

const calculateMACD = (
  prices,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) => {
  if (!Array.isArray(prices)) {
    throw new Error("Prices must be an array");
  }

  if (
    !Number.isInteger(fastPeriod) ||
    !Number.isInteger(slowPeriod) ||
    !Number.isInteger(signalPeriod)
  ) {
    throw new Error("Periods must be integers");
  }

  if (
    fastPeriod <= 0 ||
    slowPeriod <= 0 ||
    signalPeriod <= 0
  ) {
    throw new Error("Periods must be positive");
  }

  if (fastPeriod >= slowPeriod) {
    throw new Error(
      "Fast period must be smaller than slow period"
    );
  }

  if (prices.length < slowPeriod + signalPeriod - 1) {
    return null;
  }

  const macdValues = [];

  for (
    let i = slowPeriod;
    i <= prices.length;
    i++
  ) {
    const currentPrices = prices.slice(0, i);

    const fastEMA = calculateEMA(
      currentPrices,
      fastPeriod
    );

    const slowEMA = calculateEMA(
      currentPrices,
      slowPeriod
    );

    if (fastEMA !== null && slowEMA !== null) {
      macdValues.push(fastEMA - slowEMA);
    }
  }

  if (macdValues.length < signalPeriod) {
    return null;
  }

  const macdLine =
    macdValues[macdValues.length - 1];

  const signalLine = calculateEMA(
    macdValues,
    signalPeriod
  );

  const histogram =
    macdLine - signalLine;

  return {
    macdLine,
    signalLine,
    histogram,
  };
};

export { calculateMACD };