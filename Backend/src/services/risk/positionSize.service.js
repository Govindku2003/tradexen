const calculatePositionSize = ({
  accountBalance,
  riskPercentage,
  entryPrice,
  stopLossPrice,
  side = "BUY",
}) => {
  if (
    !Number.isFinite(accountBalance) ||
    accountBalance <= 0 ||
    !Number.isFinite(riskPercentage) ||
    riskPercentage <= 0 ||
    !Number.isFinite(entryPrice) ||
    entryPrice <= 0 ||
    !Number.isFinite(stopLossPrice) ||
    stopLossPrice <= 0
  ) {
    throw new Error(
      "Account balance, risk percentage, entry price and stop loss must be positive",
    );
  }

  if (!["BUY", "SELL"].includes(side)) {
    throw new Error("Trade side must be BUY or SELL");
  }

  let riskPerShare;

  if (side === "BUY") {
    if (stopLossPrice >= entryPrice) {
      throw new Error(
        "For BUY, stop loss price must be below entry price",
      );
    }

    riskPerShare = entryPrice - stopLossPrice;
  } else {
    if (stopLossPrice <= entryPrice) {
      throw new Error(
        "For SELL, stop loss price must be above entry price",
      );
    }

    riskPerShare = stopLossPrice - entryPrice;
  }

  if (!Number.isFinite(riskPerShare) || riskPerShare <= 0) {
    throw new Error("Risk per share must be positive");
  }

  const riskAmount =
    accountBalance * riskPercentage;

  const quantity = Math.floor(
    riskAmount / riskPerShare,
  );

  return {
    side,
    riskAmount,
    riskPerShare,
    quantity,
  };
};

export { calculatePositionSize };