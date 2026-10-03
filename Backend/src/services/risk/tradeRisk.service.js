const validateTradeRisk = ({
  accountBalance,
  riskAmount,
  maxRiskPercentage = 0.02,
}) => {
  if (
    !Number.isFinite(accountBalance) ||
    accountBalance <= 0
  ) {
    throw new Error(
      "Account balance must be a positive number"
    );
  }

  if (
    !Number.isFinite(riskAmount) ||
    riskAmount < 0
  ) {
    throw new Error(
      "Risk amount must be a valid non-negative number"
    );
  }

  if (
    !Number.isFinite(maxRiskPercentage) ||
    maxRiskPercentage <= 0 ||
    maxRiskPercentage > 1
  ) {
    throw new Error(
      "Maximum risk percentage must be between 0 and 1"
    );
  }

  const maxAllowedRisk =
    accountBalance * maxRiskPercentage;

  const remainingRiskCapacity =
    Math.max(
      maxAllowedRisk - riskAmount,
      0
    );

  const riskUtilization =
    maxAllowedRisk > 0
      ? (riskAmount / maxAllowedRisk) * 100
      : 0;

  const allowed =
    riskAmount <= maxAllowedRisk;

  return {
    allowed,
    accountBalance,
    riskAmount,
    maxAllowedRisk,
    remainingRiskCapacity,
    riskUtilizationPercentage: Number(
      riskUtilization.toFixed(2)
    ),
    maxRiskPercentage,
    reason: allowed
      ? "Trade risk is within allowed limit"
      : "Trade risk exceeds maximum allowed limit",
  };
};

export { validateTradeRisk };