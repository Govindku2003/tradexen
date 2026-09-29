import Position from "../../models/Position.js";

const calculatePositionPnL = async (positionId) => {
  const position = await Position.findById(positionId);

  if (!position) {
    throw new Error("Position not found");
  }

  const totalPnL =
    position.realizedPnL + position.unrealizedPnL;

  const pnlPercentage =
    position.averageEntryPrice > 0
      ? (totalPnL /
          (position.averageEntryPrice * position.quantity)) *
        100
      : 0;

  return {
    positionId: position._id,
    symbol: position.symbol,
    side: position.side,
    quantity: position.quantity,
    averageEntryPrice: position.averageEntryPrice,
    currentPrice: position.currentPrice,
    realizedPnL: position.realizedPnL,
    unrealizedPnL: position.unrealizedPnL,
    totalPnL,
    pnlPercentage,
    status: position.status,
  };
};

export { calculatePositionPnL };