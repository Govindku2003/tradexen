import {
  getTradeHistory,
  getTradeById,
  getUserTradingAccount,
} from "../services/trades/trade.service.js";

const getTradeHistoryController = async (
  req,
  res,
) => {
  try {
    const {
      symbol,
      side,
      source,
      limit = 50,
      skip = 0,
    } = req.query;

    const tradingAccount =
      await getUserTradingAccount(
        req.userId,
      );

    const result = await getTradeHistory({
      userId: req.userId,
      tradingAccountId: tradingAccount._id,
      symbol,
      side,
      source,
      limit: Number(limit),
      skip: Number(skip),
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,

        tradingAccount: {
          id: tradingAccount._id,
          accountType:
            tradingAccount.accountType,
          initialBalance:
            tradingAccount.initialBalance,
          availableBalance:
            tradingAccount.availableBalance,
          investedAmount:
            tradingAccount.investedAmount,
          currency:
            tradingAccount.currency,
          status:
            tradingAccount.status,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get trade history error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch trade history",
    });
  }
};

const getTradeController = async (
  req,
  res,
) => {
  try {
    const trade = await getTradeById({
      tradeId: req.params.tradeId,
      userId: req.userId,
    });

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        trade,
      },
    });
  } catch (error) {
    console.error(
      "Get trade error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch trade",
    });
  }
};

export {
  getTradeHistoryController,
  getTradeController,
};