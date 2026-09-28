import Strategy from "./strategy.base.js";
import { SIGNALS } from "./strategy.types.js";
import { createStrategyResult } from "./strategy.result.js";

class MovingAverageStrategy extends Strategy {
  constructor() {
    super("Moving Average Strategy");
  }

  generateSignal(marketData, indicators) {
    const fastEMA = indicators?.fastEMA;
    const slowEMA = indicators?.slowEMA;

    if (fastEMA === null || fastEMA === undefined ||
        slowEMA === null || slowEMA === undefined) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.HOLD,
        reason: "Moving average data is not available",
        indicators,
      });
    }

    if (fastEMA > slowEMA) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.BUY,
        reason: "Fast EMA is above Slow EMA",
        indicators,
      });
    }

    if (fastEMA < slowEMA) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.SELL,
        reason: "Fast EMA is below Slow EMA",
        indicators,
      });
    }

    return createStrategyResult({
      strategy: this.name,
      signal: SIGNALS.HOLD,
      reason: "Fast EMA and Slow EMA are equal",
      indicators,
    });
  }
}

export default MovingAverageStrategy;