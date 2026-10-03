import Strategy from "../../models/Strategy.js";

const getStrategies = async (userId) => {
  return Strategy.find({
    user: userId,
  }).sort({ createdAt: -1 });
};

const getStrategyById = async (userId, strategyId) => {
  return Strategy.findOne({
    _id: strategyId,
    user: userId,
  });
};

const createStrategy = async (userId, data) => {
  const {
    name,
    description = "",
    symbol,
    instrumentKey,
    exchange = "NSE",
    strategyType,
    parameters = {},
    riskSettings = {},
    isActive = false,
  } = data;

  if (!name || !symbol || !instrumentKey || !strategyType) {
    throw new Error(
      "Name, symbol, instrumentKey and strategyType are required",
    );
  }

  return Strategy.create({
    user: userId,
    name,
    description,
    symbol,
    instrumentKey,
    exchange,
    strategyType,
    parameters,
    riskSettings,
    isActive,
  });
};

const updateStrategy = async (
  userId,
  strategyId,
  data,
) => {
  const strategy = await Strategy.findOne({
    _id: strategyId,
    user: userId,
  });

  if (!strategy) {
    throw new Error("Strategy not found");
  }

  Object.assign(strategy, {
    name: data.name ?? strategy.name,
    description:
      data.description ?? strategy.description,
    symbol: data.symbol ?? strategy.symbol,
    instrumentKey:
      data.instrumentKey ?? strategy.instrumentKey,
    exchange: data.exchange ?? strategy.exchange,
    strategyType:
      data.strategyType ?? strategy.strategyType,
    parameters:
      data.parameters ?? strategy.parameters,
    riskSettings:
      data.riskSettings ?? strategy.riskSettings,
    isActive:
      data.isActive ?? strategy.isActive,
  });

  await strategy.save();

  return strategy;
};

const deleteStrategy = async (
  userId,
  strategyId,
) => {
  const strategy = await Strategy.findOneAndDelete({
    _id: strategyId,
    user: userId,
  });

  if (!strategy) {
    throw new Error("Strategy not found");
  }

  return strategy;
};

const toggleStrategy = async (
  userId,
  strategyId,
) => {
  const strategy = await Strategy.findOne({
    _id: strategyId,
    user: userId,
  });

  if (!strategy) {
    throw new Error("Strategy not found");
  }

  strategy.isActive = !strategy.isActive;

  await strategy.save();

  return strategy;
};

export {
  getStrategies,
  getStrategyById,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  toggleStrategy,
};