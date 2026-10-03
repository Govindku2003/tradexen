const calculateTakeProfit = ({
  entryPrice,
  stopLossPrice,
  riskRewardRatio = 2,
  side = "BUY",
  minRiskRewardRatio = 1,
  maxRiskRewardRatio = 10,
  tickSize = 0.05,
}) => {
  if (
    !Number.isFinite(entryPrice) ||
    entryPrice <= 0
  ) {
    throw new Error("Entry price must be positive");
  }

  if (
    !Number.isFinite(stopLossPrice) ||
    stopLossPrice <= 0
  ) {
    throw new Error(
      "Stop loss price must be positive"
    );
  }

  if (
    !Number.isFinite(riskRewardRatio) ||
    riskRewardRatio <= 0
  ) {
    throw new Error(
      "Risk-reward ratio must be positive"
    );
  }

  if (
    riskRewardRatio < minRiskRewardRatio ||
    riskRewardRatio > maxRiskRewardRatio
  ) {
    throw new Error(
      `Risk-reward ratio must be between ${minRiskRewardRatio} and ${maxRiskRewardRatio}`
    );
  }

  if (!["BUY", "SELL"].includes(side)) {
    throw new Error(
      "Trade side must be BUY or SELL"
    );
  }

  let risk;
  let takeProfitPrice;

  if (side === "BUY") {
    if (stopLossPrice >= entryPrice) {
      throw new Error(
        "For BUY, stop loss must be below entry price"
      );
    }

    risk = entryPrice - stopLossPrice;

    takeProfitPrice =
      entryPrice +
      risk * riskRewardRatio;
  } else {
    if (stopLossPrice <= entryPrice) {
      throw new Error(
        "For SELL, stop loss must be above entry price"
      );
    }

    risk = stopLossPrice - entryPrice;

    takeProfitPrice =
      entryPrice -
      risk * riskRewardRatio;
  }

  const roundedTakeProfit =
    Math.round(takeProfitPrice / tickSize) *
    tickSize;

  return {
    entryPrice,
    stopLossPrice,
    risk: Number(risk.toFixed(2)),
    riskRewardRatio,
    side,
    takeProfitPrice: Number(
      roundedTakeProfit.toFixed(2)
    ),
    tickSize,
  };
};

export { calculateTakeProfit };