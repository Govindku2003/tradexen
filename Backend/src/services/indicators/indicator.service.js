import { calculateSMA } from "./sma.indicator.js";
import { calculateEMA } from "./ema.indicator.js";
import { calculateRSI } from "./rsi.indicator.js";
import { calculateMACD } from "./macd.indicator.js";

const calculateIndicators = (prices, config = {}) => {
  const {
    smaPeriod = 20,
    emaPeriod = 20,
    rsiPeriod = 14,
    macdFastPeriod = 12,
    macdSlowPeriod = 26,
    macdSignalPeriod = 9,
  } = config;

  return {
    sma: calculateSMA(prices, smaPeriod),

    ema: calculateEMA(prices, emaPeriod),

    rsi: calculateRSI(prices, rsiPeriod),

    macd: calculateMACD(
      prices,
      macdFastPeriod,
      macdSlowPeriod,
      macdSignalPeriod
    ),
  };
};

export { calculateIndicators };