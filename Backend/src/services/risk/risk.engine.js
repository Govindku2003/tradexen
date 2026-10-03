import { calculatePositionSize } from "./positionSize.service.js";
import { calculateStopLoss } from "./stopLoss.service.js";
import { calculateTakeProfit } from "./takeProfit.service.js";
import { validateTrade } from "./risk.validation.js";

const evaluateTradeRisk = ({
  accountBalance,
  entryPrice,
  stopLossPercentage = 2,
  riskPercentage = 0.02,
  riskRewardRatio = 2,
  dailyLoss = 0,
  investedAmount = 0,
  proposedExposure = 0,
  maxExposurePercentage = 1,
  side = "BUY",
}) => {
  const stopLoss = calculateStopLoss({
    entryPrice,
    stopLossPercentage,
    side,
  });

  const takeProfit = calculateTakeProfit({
    entryPrice,
    stopLossPrice: stopLoss.stopLossPrice,
    riskRewardRatio,
    side,
  });

  const positionSize = calculatePositionSize({
    accountBalance,
    riskPercentage,
    entryPrice,
    stopLossPrice: stopLoss.stopLossPrice,
    side,
  });

  const riskValidation = validateTrade({
    accountBalance,
    riskAmount: positionSize.riskAmount,
    dailyLoss,
    investedAmount,
    proposedExposure,
    maxExposurePercentage,
  });

  return {
    side,
    entryPrice,

    stopLoss,
    takeProfit,

    positionSize,

    exposure: {
      investedAmount,
      proposedExposure,
      totalExposure: investedAmount + proposedExposure,
      maxExposurePercentage,
    },

    riskValidation,
  };
};

export { evaluateTradeRisk };
