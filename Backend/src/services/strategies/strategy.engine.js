import strategyManager from "./strategy.manager.js";
import { validateSignals } from "./signal.validator.js";

const runStrategies = (marketData, indicators) => {
  const strategyKeys =
    strategyManager.getAvailableStrategies();

  const results = strategyKeys.map((key) =>
    strategyManager.generateSignal(
      key,
      marketData,
      indicators
    )
  );

  const validation = validateSignals(results);

  return {
    strategies: results,
    decision: validation,
  };
};

export { runStrategies };