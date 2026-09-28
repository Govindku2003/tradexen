import Strategy from "./strategy.base.js";
import { SIGNALS } from "./strategy.types.js";
import { createStrategyResult } from "./strategy.result.js";

class MACDStrategy extends Strategy {
  constructor() {
    super("MACD Strategy");
  }

  generateSignal(marketData, indicators) {
    const macd = indicators?.macd;

    if (
      !macd ||
      macd.macdLine === null ||
      macd.macdLine === undefined ||
      macd.signalLine === null ||
      macd.signalLine === undefined
    ) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.HOLD,
        reason: "MACD data is not available",
        indicators,
      });
    }

    if (macd.macdLine > macd.signalLine) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.BUY,
        reason: "MACD line is above Signal line",
        indicators,
      });
    }

    if (macd.macdLine < macd.signalLine) {
      return createStrategyResult({
        strategy: this.name,
        signal: SIGNALS.SELL,
        reason: "MACD line is below Signal line",
        indicators,
      });
    }

    return createStrategyResult({
      strategy: this.name,
      signal: SIGNALS.HOLD,
      reason: "MACD line and Signal line are equal",
      indicators,
    });
  }
}

export default MACDStrategy;