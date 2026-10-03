import { evaluateTradeRisk } from "./risk.engine.js";
import { RISK_DECISIONS } from "./risk.types.js";

class RiskManager {
  constructor(config = {}) {
    this.maxRiskPerTrade =
      config.maxRiskPerTrade ?? 0.02;

    this.maxDailyLoss =
      config.maxDailyLoss ?? 0.05;

    this.defaultStopLossPercentage =
      config.defaultStopLossPercentage ?? 2;

    this.defaultRiskRewardRatio =
      config.defaultRiskRewardRatio ?? 2;

    this.maxExposurePercentage =
      config.maxExposurePercentage ?? 1;
  }

  evaluateTrade(trade) {
    if (!trade) {
      return {
        decision: RISK_DECISIONS.REJECT,
        allowed: false,
        reason: "Trade data is required",
      };
    }

    const {
      accountBalance,
      entryPrice,

      stopLossPercentage =
        this.defaultStopLossPercentage,

      riskPercentage =
        this.maxRiskPerTrade,

      riskRewardRatio =
        this.defaultRiskRewardRatio,

      dailyLoss = 0,

      investedAmount = 0,

      proposedExposure = 0,

      maxExposurePercentage =
        this.maxExposurePercentage,

      side = "BUY",
    } = trade;

    if (
      typeof accountBalance !== "number" ||
      accountBalance <= 0
    ) {
      return {
        decision: RISK_DECISIONS.REJECT,
        allowed: false,
        reason: "Valid account balance is required",
      };
    }

    if (
      typeof entryPrice !== "number" ||
      entryPrice <= 0
    ) {
      return {
        decision: RISK_DECISIONS.REJECT,
        allowed: false,
        reason: "Valid entry price is required",
      };
    }

    try {
      const result = evaluateTradeRisk({
        accountBalance,
        entryPrice,
        stopLossPercentage,
        riskPercentage,
        riskRewardRatio,
        dailyLoss,

        investedAmount,
        proposedExposure,
        maxExposurePercentage,

        side,
      });

      return {
        ...result,
        decision: result.riskValidation.decision,
        allowed: result.riskValidation.allowed,
      };
    } catch (error) {
      return {
        decision: RISK_DECISIONS.REJECT,
        allowed: false,
        reason: error.message,
      };
    }
  }
}

const riskManager = new RiskManager();

export default riskManager;