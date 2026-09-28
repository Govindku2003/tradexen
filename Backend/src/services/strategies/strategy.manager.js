import RSIStrategy from "./rsi.strategy.js";
import MovingAverageStrategy from "./movingAverage.strategy.js";
import MACDStrategy from "./macd.strategy.js";

class StrategyManager {
  constructor() {
    this.strategies = new Map();

    this.registerStrategy("rsi", new RSIStrategy());
    this.registerStrategy(
      "moving-average",
      new MovingAverageStrategy()
    );
    this.registerStrategy("macd", new MACDStrategy());
  }

  registerStrategy(key, strategy) {
    this.strategies.set(key, strategy);
  }

  getStrategy(key) {
    const strategy = this.strategies.get(key);

    if (!strategy) {
      throw new Error(`Strategy not found: ${key}`);
    }

    return strategy;
  }

  getAvailableStrategies() {
    return [...this.strategies.keys()];
  }

  generateSignal(key, marketData, indicators) {
    const strategy = this.getStrategy(key);

    return strategy.generateSignal(
      marketData,
      indicators
    );
  }
}

const strategyManager = new StrategyManager();

export default strategyManager;