const calculateStopLoss = ({
  entryPrice,
  stopLossPercentage,
  side = "BUY",
  maxStopLossPercentage = 5,
  tickSize = 0.05,
}) => {
  if (
    !Number.isFinite(entryPrice) ||
    entryPrice <= 0
  ) {
    throw new Error("Entry price must be positive");
  }

  if (
    !Number.isFinite(stopLossPercentage) ||
    stopLossPercentage <= 0
  ) {
    throw new Error(
      "Stop loss percentage must be positive"
    );
  }

  if (
    !Number.isFinite(maxStopLossPercentage) ||
    maxStopLossPercentage <= 0
  ) {
    throw new Error(
      "Maximum stop loss percentage must be positive"
    );
  }

  if (
    stopLossPercentage > maxStopLossPercentage
  ) {
    throw new Error(
      `Stop loss cannot exceed ${maxStopLossPercentage}%`
    );
  }

  if (!["BUY", "SELL"].includes(side)) {
    throw new Error(
      "Trade side must be BUY or SELL"
    );
  }

  const percentage =
    stopLossPercentage / 100;

  let stopLossPrice;

  if (side === "BUY") {
    stopLossPrice =
      entryPrice * (1 - percentage);
  } else {
    stopLossPrice =
      entryPrice * (1 + percentage);
  }

  const roundedStopLoss =
    Math.round(stopLossPrice / tickSize) *
    tickSize;

  return {
    entryPrice,
    stopLossPercentage,
    side,
    stopLossPrice: Number(
      roundedStopLoss.toFixed(2)
    ),
    maxStopLossPercentage,
    tickSize,
  };
};

export { calculateStopLoss };