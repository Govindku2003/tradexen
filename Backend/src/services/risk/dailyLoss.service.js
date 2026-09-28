const validateDailyLoss = ({
  accountBalance,
  dailyLoss,
  maxDailyLossPercentage = 0.05,
}) => {
  if (
    accountBalance <= 0 ||
    dailyLoss < 0 ||
    maxDailyLossPercentage <= 0
  ) {
    throw new Error(
      "Account balance, daily loss and maximum daily loss percentage must be valid"
    );
  }

  const maxAllowedDailyLoss =
    accountBalance * maxDailyLossPercentage;

  const allowed =
    dailyLoss <= maxAllowedDailyLoss;

  return {
    allowed,
    accountBalance,
    dailyLoss,
    maxAllowedDailyLoss,
    maxDailyLossPercentage,
    reason: allowed
      ? "Daily loss is within allowed limit"
      : "Daily loss exceeds maximum allowed limit",
  };
};

export { validateDailyLoss };