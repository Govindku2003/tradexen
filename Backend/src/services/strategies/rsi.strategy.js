import Strategy from "./strategy.base.js";
import { SIGNALS } from "./strategy.types.js";
import { createStrategyResult } from "./strategy.result.js";

class RSIStrategy extends Strategy {
  constructor(config = {}) {
    super("RSI Strategy");

    this.oversold = config.oversold ?? 30;
    this.overbought = config.overbought ?? 70;
  }

  generateSignal(marketData, indicators) {
    const rsi = indicators?.rsi;

    if (rsi === null || rsi === undefined) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.HOLD,
        reason: "RSI data is not available",
        indicators,
      });
    }

    if (rsi < this.oversold) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.BUY,
        reason: `RSI is below ${this.oversold}`,
        indicators,
      });
    }

    if (rsi > this.overbought) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.SELL,
        reason: `RSI is above ${this.overbought}`,
        indicators,
      });
    }

    return createStrategyResult({
      strategy: this.name,
      signal: SIGNALS.HOLD,
      reason: "RSI is in the neutral range",
      indicators,
    });
  }
}

export default RSIStrategy;