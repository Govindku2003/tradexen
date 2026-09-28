const calculateStopLoss = ({
  entryPrice,
  stopLossPercentage,
  side = "BUY",
}) => {
  if (
    entryPrice <= 0 ||
    stopLossPercentage <= 0
  ) {
    throw new Error(
      "Entry price and stop loss percentage must be positive"
    );
  }

  const percentage =
    stopLossPercentage / 100;

  let stopLossPrice;

  if (side === "BUY") {
    stopLossPrice =
      entryPrice * (1 - percentage);
  } else if (side === "SELL") {
    stopLossPrice =
      entryPrice * (1 + percentage);
  } else {
    throw new Error(
      "Trade side must be BUY or SELL"
    );
  }

  return {
    entryPrice,
    stopLossPercentage,
    side,
    stopLossPrice,
  };
};

export { calculateStopLoss };