import { validateTradeRisk } from "./tradeRisk.service.js";
import { validateDailyLoss } from "./dailyLoss.service.js";
import { RISK_DECISIONS } from "./risk.types.js";

const validatePortfolioExposure = ({
  accountBalance,
  investedAmount = 0,
  proposedExposure = 0,
  maxExposurePercentage = 1,
}) => {
  if (
    !Number.isFinite(accountBalance) ||
    accountBalance <= 0
  ) {
    throw new Error("Account balance must be a positive number");
  }

  if (
    !Number.isFinite(investedAmount) ||
    investedAmount < 0
  ) {
    throw new Error("Invested amount must be a valid non-negative number");
  }

  if (
    !Number.isFinite(proposedExposure) ||
    proposedExposure < 0
  ) {
    throw new Error("Proposed exposure must be a valid non-negative number");
  }

  if (
    !Number.isFinite(maxExposurePercentage) ||
    maxExposurePercentage <= 0 ||
    maxExposurePercentage > 1
  ) {
    throw new Error(
      "Maximum exposure percentage must be between 0 and 1"
    );
  }

  const maxAllowedExposure =
    accountBalance * maxExposurePercentage;

  const totalExposure =
    investedAmount + proposedExposure;

  const allowed =
    totalExposure <= maxAllowedExposure;

  const remainingExposureCapacity = Math.max(
    maxAllowedExposure - investedAmount,
    0
  );

  return {
    allowed,
    accountBalance,
    investedAmount,
    proposedExposure,
    totalExposure,
    maxAllowedExposure,
    remainingExposureCapacity,
    maxExposurePercentage,
    reason: allowed
      ? "Portfolio exposure is within allowed limit"
      : "Portfolio exposure exceeds maximum allowed limit",
  };
};

const validateTrade = ({
  accountBalance,
  riskAmount,
  dailyLoss,
  investedAmount = 0,
  proposedExposure = 0,
  maxRiskPercentage = 0.02,
  maxDailyLossPercentage = 0.05,
  maxExposurePercentage = 1,
}) => {
  const tradeRisk = validateTradeRisk({
    accountBalance,
    riskAmount,
    maxRiskPercentage,
  });

  const dailyRisk = validateDailyLoss({
    accountBalance,
    dailyLoss,
    maxDailyLossPercentage,
  });

  const exposureRisk = validatePortfolioExposure({
    accountBalance,
    investedAmount,
    proposedExposure,
    maxExposurePercentage,
  });

  const allowed =
    tradeRisk.allowed &&
    dailyRisk.allowed &&
    exposureRisk.allowed;

  return {
    decision: allowed
      ? RISK_DECISIONS.ALLOW
      : RISK_DECISIONS.REJECT,

    allowed,

    checks: {
      tradeRisk,
      dailyLoss: dailyRisk,
      portfolioExposure: exposureRisk,
    },

    reason: allowed
      ? "Trade passed all risk checks"
      : "Trade failed one or more risk checks",
  };
};

export {
  validateTrade,
  validatePortfolioExposure,
};