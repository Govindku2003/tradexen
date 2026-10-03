import Trade from "../../models/Trade.js";
import TradingAccount from "../../models/TradingAccount.js";

const getTradeHistory = async ({
  userId,
  tradingAccountId = null,
  symbol = null,
  side = null,
  source = null,
  limit = 50,
  skip = 0,
}) => {
  const query = {
    user: userId,
  };

  if (tradingAccountId) {
    query.tradingAccount = tradingAccountId;
  }

  if (symbol) {
    query.symbol = symbol.toUpperCase();
  }

  if (side) {
    query.side = side.toUpperCase();
  }

  if (source) {
    query.source = source.toUpperCase();
  }

  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100,
  );

  const safeSkip = Math.max(
    Number(skip) || 0,
    0,
  );

  const [trades, total] = await Promise.all([
    Trade.find(query)
      .sort({
        executedAt: -1,
        createdAt: -1,
      })
      .skip(safeSkip)
      .limit(safeLimit)
      .lean(),

    Trade.countDocuments(query),
  ]);

  return {
    trades,
    pagination: {
      total,
      limit: safeLimit,
      skip: safeSkip,
      hasMore:
        safeSkip + trades.length < total,
    },
  };
};

const getTradeById = async ({
  tradeId,
  userId,
}) => {
  const trade = await Trade.findOne({
    _id: tradeId,
    user: userId,
  }).lean();

  return trade;
};

const getUserTradingAccount = async (
  userId,
) => {
  const tradingAccount =
    await TradingAccount.findOne({
      user: userId,
      status: "active",
    });

  if (!tradingAccount) {
    throw new Error(
      "Active trading account not found",
    );
  }

  return tradingAccount;
};

export {
  getTradeHistory,
  getTradeById,
  getUserTradingAccount,
};