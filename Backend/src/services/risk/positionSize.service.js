const calculatePositionSize = ({
  accountBalance,
  riskPercentage,
  entryPrice,
  stopLossPrice,
}) => {
  if (
    accountBalance <= 0 ||
    riskPercentage <= 0 ||
    entryPrice <= 0 ||
    stopLossPrice <= 0
  ) {
    throw new Error(
      "Account balance, risk percentage, entry price and stop loss must be positive"
    );
  }

  if (stopLossPrice >= entryPrice) {
    throw new Error(
      "Stop loss price must be below entry price for a BUY trade"
    );
  }

  const riskAmount =
    accountBalance * riskPercentage;

  const riskPerShare =
    entryPrice - stopLossPrice;

  const quantity = Math.floor(
    riskAmount / riskPerShare
  );

  return {
    riskAmount,
    riskPerShare,
    quantity,
  };
};

export { calculatePositionSize };