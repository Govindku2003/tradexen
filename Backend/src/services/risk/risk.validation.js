import { validateTradeRisk } from "./tradeRisk.service.js";
import { validateDailyLoss } from "./dailyLoss.service.js";
import { RISK_DECISIONS } from "./risk.types.js";

const validateTrade = ({
  accountBalance,
  riskAmount,
  dailyLoss,
  maxRiskPercentage = 0.02,
  maxDailyLossPercentage = 0.05,
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

  const allowed =
    tradeRisk.allowed && dailyRisk.allowed;

  return {
    decision: allowed
      ? RISK_DECISIONS.ALLOW
      : RISK_DECISIONS.REJECT,

    allowed,

    checks: {
      tradeRisk,
      dailyLoss: dailyRisk,
    },

    reason: allowed
      ? "Trade passed all risk checks"
      : "Trade failed one or more risk checks",
  };
};

export { validateTrade };