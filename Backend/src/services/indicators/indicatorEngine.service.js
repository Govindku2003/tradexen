import { calculateIndicators } from "./indicator.service.js";

const calculateMarketIndicators = (
  prices,
  config = {}
) => {
  if (!Array.isArray(prices)) {
    throw new Error("Prices must be an array");
  }

  if (prices.length === 0) {
    throw new Error("Prices array cannot be empty");
  }

  return {
    price: prices[prices.length - 1],
    indicators: calculateIndicators(prices, config),
    calculatedAt: new Date().toISOString(),
  };
};

export { calculateMarketIndicators };