const validateTradeRisk = ({
  accountBalance,
  riskAmount,
  maxRiskPercentage = 0.02,
}) => {
  if (
    accountBalance <= 0 ||
    riskAmount < 0 ||
    maxRiskPercentage <= 0
  ) {
    throw new Error(
      "Account balance, risk amount and max risk percentage must be valid"
    );
  }

  const maxAllowedRisk =
    accountBalance * maxRiskPercentage;

  const allowed =
    riskAmount <= maxAllowedRisk;

  return {
    allowed,
    accountBalance,
    riskAmount,
    maxAllowedRisk,
    maxRiskPercentage,
    reason: allowed
      ? "Trade risk is within allowed limit"
      : "Trade risk exceeds maximum allowed limit",
  };
};

export { validateTradeRisk };