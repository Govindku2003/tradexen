import Position from "../../models/Position.js";

const getOpenPosition = async ({ userId, tradingAccountId, symbol }) => {
  return Position.findOne({
    user: userId,
    tradingAccount: tradingAccountId,
    symbol: symbol.toUpperCase(),
    status: "OPEN",
  });
};

const getPositionById = async ({ positionId, userId }) => {
  return Position.findOne({
    _id: positionId,
    user: userId,
  });
};

const getPositionHistory = async ({
  userId,
  tradingAccountId,
  status = null,
  limit = 20,
  skip = 0,
}) => {
  const query = {
    user: userId,
    tradingAccount: tradingAccountId,
  };

  if (status) {
    query.status = status;
  }

  const positions = await Position.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Position.countDocuments(query);

  return {
    positions,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + positions.length < total,
    },
  };
};

const createPosition = async ({
  userId,
  tradingAccountId,
  symbol,
  side = "LONG",
  quantity,
  entryPrice,
  currentPrice = null,
  stopLoss = null,
  takeProfit = null,
}) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!tradingAccountId) {
    throw new Error("Trading account ID is required");
  }

  if (!symbol) {
    throw new Error("Symbol is required");
  }

  if (!["LONG", "SHORT"].includes(side)) {
    throw new Error("Position side must be LONG or SHORT");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  if (typeof entryPrice !== "number" || entryPrice <= 0) {
    throw new Error("Entry price must be positive");
  }

  const existingPosition = await getOpenPosition({
    userId,
    tradingAccountId,
    symbol,
  });

  if (existingPosition) {
    throw new Error(`Open position already exists for ${symbol.toUpperCase()}`);
  }

  const position = await Position.create({
    user: userId,
    tradingAccount: tradingAccountId,
    symbol: symbol.toUpperCase(),
    exchange: "NSE",
    side,
    quantity,
    averageEntryPrice: entryPrice,
    currentPrice: currentPrice ?? entryPrice,
    stopLoss,
    takeProfit,
    realizedPnL: 0,
    unrealizedPnL: 0,
    status: "OPEN",
  });

  return position;
};

const updatePositionAfterBuy = async ({ positionId, quantity, entryPrice }) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  if (typeof entryPrice !== "number" || entryPrice <= 0) {
    throw new Error("Entry price must be positive");
  }

  const position = await Position.findById(positionId);

  if (!position) {
    throw new Error("Position not found");
  }

  if (position.status !== "OPEN") {
    throw new Error("Only an open position can be updated");
  }

  const oldQuantity = position.quantity;
  const oldAveragePrice = position.averageEntryPrice;

  const newQuantity = oldQuantity + quantity;

  const newAveragePrice =
    (oldQuantity * oldAveragePrice + quantity * entryPrice) / newQuantity;

  position.quantity = newQuantity;
  position.averageEntryPrice = newAveragePrice;
  position.currentPrice = entryPrice;

  await position.save();

  return position;
};

const closeOrReducePosition = async ({ positionId, quantity, exitPrice }) => {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  if (typeof exitPrice !== "number" || exitPrice <= 0) {
    throw new Error("Exit price must be positive");
  }

  const position = await Position.findById(positionId);

  if (!position) {
    throw new Error("Position not found");
  }

  if (position.status !== "OPEN") {
    throw new Error("Only an open position can be closed or reduced");
  }

  if (quantity > position.quantity) {
    throw new Error("Sell quantity exceeds position quantity");
  }

  const realizedPnL = (exitPrice - position.averageEntryPrice) * quantity;

  position.realizedPnL += realizedPnL;
  position.currentPrice = exitPrice;
  position.quantity -= quantity;

  if (position.quantity === 0) {
    position.status = "CLOSED";
    position.closedAt = new Date();
    position.unrealizedPnL = 0;
  }

  await position.save();

  return {
    position,
    realizedPnL,
  };
};

const calculateInvestedAmount = async ({
  userId,
  tradingAccountId,
}) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!tradingAccountId) {
    throw new Error("Trading account ID is required");
  }

  const openPositions = await Position.find({
    user: userId,
    tradingAccount: tradingAccountId,
    status: "OPEN",
  });

  const investedAmount = openPositions.reduce(
    (total, position) =>
      total + position.quantity * position.averageEntryPrice,
    0,
  );

  return investedAmount;
};



const calculateUnrealizedPnL = async ({ positionId, currentPrice }) => {
  if (typeof currentPrice !== "number" || currentPrice <= 0) {
    throw new Error("Current price must be positive");
  }

  const position = await Position.findById(positionId);

  if (!position) {
    throw new Error("Position not found");
  }

  if (position.status !== "OPEN") {
    throw new Error("Unrealized P&L is only available for open positions");
  }

  let unrealizedPnL;

  if (position.side === "LONG") {
    unrealizedPnL =
      (currentPrice - position.averageEntryPrice) * position.quantity;
  } else {
    unrealizedPnL =
      (position.averageEntryPrice - currentPrice) * position.quantity;
  }

  position.currentPrice = currentPrice;
  position.unrealizedPnL = unrealizedPnL;

  await position.save();

  return position;
};

export {
  getOpenPosition,
  getPositionById,
  getPositionHistory,
  createPosition,
  updatePositionAfterBuy,
  closeOrReducePosition,
  calculateInvestedAmount,
};
