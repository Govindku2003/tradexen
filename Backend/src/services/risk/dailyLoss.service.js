import Trade from "../../models/Trade.js";

const getTodayDateRange = () => {
  const start = new Date();

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start,
    end,
  };
};

const getTodayRealizedPnL = async ({
  tradingAccountId,
}) => {
  if (!tradingAccountId) {
    throw new Error("Trading account is required");
  }

  const { start, end } = getTodayDateRange();

  const result = await Trade.aggregate([
    {
      $match: {
        tradingAccount: tradingAccountId,
        executedAt: {
          $gte: start,
          $lt: end,
        },
      },
    },

    {
      $group: {
        _id: null,
        realizedPnL: {
          $sum: "$realizedPnL",
        },
      },
    },
  ]);

  const realizedPnL =
    result.length > 0
      ? Number(result[0].realizedPnL || 0)
      : 0;

  // Risk manager works with positive loss amount.
  const dailyLoss = realizedPnL < 0
    ? Math.abs(realizedPnL)
    : 0;

  return {
    realizedPnL,
    dailyLoss,
    start,
    end,
  };
};

const validateDailyLoss = ({
  accountBalance,
  dailyLoss,
  maxDailyLossPercentage = 0.05,
}) => {
  if (
    typeof accountBalance !== "number" ||
    accountBalance <= 0 ||
    typeof dailyLoss !== "number" ||
    dailyLoss < 0 ||
    typeof maxDailyLossPercentage !== "number" ||
    maxDailyLossPercentage <= 0
  ) {
    throw new Error(
      "Account balance, daily loss and maximum daily loss percentage must be valid"
    );
  }

  const maxAllowedDailyLoss =
    accountBalance * maxDailyLossPercentage;

  const allowed =
    dailyLoss <= maxAllowedDailyLoss;

  return {
    allowed,
    accountBalance,
    dailyLoss,
    maxAllowedDailyLoss,
    maxDailyLossPercentage,
    reason: allowed
      ? "Daily loss is within allowed limit"
      : "Daily loss exceeds maximum allowed limit",
  };
};

export {
  getTodayRealizedPnL,
  validateDailyLoss,
};