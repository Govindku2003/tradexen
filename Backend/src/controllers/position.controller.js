import TradingAccount from "../models/TradingAccount.js";

import {
  getPositionById,
  getPositionHistory,
} from "../services/positions/position.service.js";

const getPositionController = async (req, res) => {
  try {
    const position = await getPositionById({
      positionId: req.params.positionId,
      userId: req.userId,
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        message: "Position not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        position,
      },
    });
  } catch (error) {
    console.error("Get position error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getPositionHistoryController = async (req, res) => {
  try {
    const { status, limit = 20, skip = 0 } = req.query;

    // Find trading account of currently authenticated user
    const tradingAccount = await TradingAccount.findOne({
      user: req.userId,
      status: "active",
    });

    if (!tradingAccount) {
      return res.status(404).json({
        success: false,
        message: "Trading account not found",
      });
    }

    const result = await getPositionHistory({
      userId: req.userId,
      tradingAccountId: tradingAccount._id,
      status: status || null,
      limit: Number(limit),
      skip: Number(skip),
    });

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        tradingAccount: {
          id: tradingAccount._id,
          accountType: tradingAccount.accountType,
          initialBalance: tradingAccount.initialBalance,
          availableBalance: tradingAccount.availableBalance,
          investedAmount: tradingAccount.investedAmount,
          currency: tradingAccount.currency,
          status: tradingAccount.status,
        },
      },
    });
  } catch (error) {
    console.error("Get position history error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { getPositionController, getPositionHistoryController };
