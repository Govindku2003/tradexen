import { calculateUnrealizedPnL } from "./position.service.js";
import { calculatePositionPnL } from "./pnl.service.js";

const updateAndCalculatePositionPnL = async ({
  positionId,
  currentPrice,
}) => {
  await calculateUnrealizedPnL({
    positionId,
    currentPrice,
  });

  return calculatePositionPnL(positionId);
};

export { updateAndCalculatePositionPnL };