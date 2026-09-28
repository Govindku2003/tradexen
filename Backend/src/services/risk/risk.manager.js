import { RISK_DECISIONS } from "./risk.types.js";

class RiskManager {
  constructor(config = {}) {
    this.maxRiskPerTrade =
      config.maxRiskPerTrade ?? 0.02;

    this.maxDailyLoss =
      config.maxDailyLoss ?? 0.05;
  }

  evaluateTrade(trade) {
    if (!trade) {
      return {
        decision: RISK_DECISIONS.REJECT,
        reason: "Trade data is required",
      };
    }

    return {
      decision: RISK_DECISIONS.ALLOW,
      reason: "Trade passed initial risk validation",
    };
  }
}

const riskManager = new RiskManager();

export default riskManager;