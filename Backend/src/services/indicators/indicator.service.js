import { calculateSMA } from "./sma.indicator.js";
import { calculateEMA } from "./ema.indicator.js";
import { calculateRSI } from "./rsi.indicator.js";
import { calculateMACD } from "./macd.indicator.js";

/**
 * Calculate latest indicator values.
 * Existing Strategy Engine depends on this shape,
 * so backward compatibility is maintained.
 */
const calculateIndicators = (prices, config = {}) => {
  const {
    smaPeriod = 20,
    emaPeriod = 20,
    fastEMAPeriod = 9,
    slowEMAPeriod = 21,
    rsiPeriod = 14,
    macdFastPeriod = 12,
    macdSlowPeriod = 26,
    macdSignalPeriod = 9,
  } = config;

  return {
    sma: calculateSMA(prices, smaPeriod),

    ema: calculateEMA(prices, emaPeriod),

    fastEMA: calculateEMA(prices, fastEMAPeriod),

    slowEMA: calculateEMA(prices, slowEMAPeriod),

    rsi: calculateRSI(prices, rsiPeriod),

    macd: calculateMACD(
      prices,
      macdFastPeriod,
      macdSlowPeriod,
      macdSignalPeriod,
    ),
  };
};

/**
 * Calculate indicator values for every candle.
 */
const calculateIndicatorSeries = (prices, config = {}) => {
  if (!Array.isArray(prices)) {
    throw new Error("Prices must be an array");
  }

  if (prices.length === 0) {
    throw new Error("Prices array cannot be empty");
  }

  const {
    smaPeriod = 20,
    emaPeriod = 20,
    fastEMAPeriod = 9,
    slowEMAPeriod = 21,
    rsiPeriod = 14,
    macdFastPeriod = 12,
    macdSlowPeriod = 26,
    macdSignalPeriod = 9,
  } = config;

  const sma = [];
  const ema = [];
  const fastEMA = [];
  const slowEMA = [];
  const rsi = [];
  const macd = [];

  for (let i = 0; i < prices.length; i += 1) {
    const currentPrices = prices.slice(0, i + 1);

    sma.push(calculateSMA(currentPrices, smaPeriod));

    ema.push(calculateEMA(currentPrices, emaPeriod));

    fastEMA.push(calculateEMA(currentPrices, fastEMAPeriod));

    slowEMA.push(calculateEMA(currentPrices, slowEMAPeriod));

    rsi.push(calculateRSI(currentPrices, rsiPeriod));

    macd.push(
      calculateMACD(
        currentPrices,
        macdFastPeriod,
        macdSlowPeriod,
        macdSignalPeriod,
      ),
    );
  }

  return {
    sma,
    ema,
    fastEMA,
    slowEMA,
    rsi,
    macd,
  };
};

export { calculateIndicators, calculateIndicatorSeries };
