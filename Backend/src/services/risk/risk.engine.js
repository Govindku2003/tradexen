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
  });

  const riskValidation = validateTrade({
    accountBalance,
    riskAmount: positionSize.riskAmount,
    dailyLoss,
  });

  return {
    side,
    entryPrice,
    stopLoss,
    takeProfit,
    positionSize,
    riskValidation,
  };
};

export { evaluateTradeRisk };