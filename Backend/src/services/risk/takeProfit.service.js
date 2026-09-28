const calculateTakeProfit = ({
  entryPrice,
  stopLossPrice,
  riskRewardRatio = 2,
  side = "BUY",
}) => {
  if (
    entryPrice <= 0 ||
    stopLossPrice <= 0 ||
    riskRewardRatio <= 0
  ) {
    throw new Error(
      "Entry price, stop loss and risk-reward ratio must be positive"
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
      entryPrice + risk * riskRewardRatio;
  } else if (side === "SELL") {
    if (stopLossPrice <= entryPrice) {
      throw new Error(
        "For SELL, stop loss must be above entry price"
      );
    }

    risk = stopLossPrice - entryPrice;

    takeProfitPrice =
      entryPrice - risk * riskRewardRatio;
  } else {
    throw new Error(
      "Trade side must be BUY or SELL"
    );
  }

  return {
    entryPrice,
    stopLossPrice,
    risk,
    riskRewardRatio,
    side,
    takeProfitPrice,
  };
};

export { calculateTakeProfit };