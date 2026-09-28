import { SIGNALS } from "./strategy.types.js";

const validateSignals = (strategyResults = []) => {
  if (!Array.isArray(strategyResults)) {
    throw new Error("Strategy results must be an array");
  }

  const validSignals = Object.values(SIGNALS);

  const validResults = strategyResults.filter(
    (result) =>
      result &&
      validSignals.includes(result.signal)
  );

  const counts = {
    BUY: 0,
    SELL: 0,
    HOLD: 0,
  };

  for (const result of validResults) {
    counts[result.signal] += 1;
  }

  const hasConflict =
    counts.BUY > 0 && counts.SELL > 0;

  let finalSignal = SIGNALS.HOLD;

  if (!hasConflict) {
    if (counts.BUY > counts.SELL) {
      finalSignal = SIGNALS.BUY;
    } else if (counts.SELL > counts.BUY) {
      finalSignal = SIGNALS.SELL;
    }
  }

  return {
    finalSignal,
    counts,
    hasConflict,
    validResults,
    totalStrategies: validResults.length,
  };
};

export { validateSignals };