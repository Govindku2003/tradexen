import {
  runBacktest,
  getBacktestHistory,
  getBacktestById,
} from "../services/backtesting/backtesting.service.js";

const runBacktestController = async (req, res) => {
  try {
    const {
      instrumentKey,
      unit = "days",
      interval = "1",
      from,
      to,
      initialCapital,
      quantity = 1,
      strategyKey = "all",
      smaPeriod = 20,
      emaPeriod = 20,
      rsiPeriod = 14,
      macdFastPeriod = 12,
      macdSlowPeriod = 26,
      macdSignalPeriod = 9,
    } = req.body;

    /*
     * IMPORTANT:
     * TradeXen auth middleware stores the
     * authenticated user ID in req.userId.
     */
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!instrumentKey) {
      return res.status(400).json({
        success: false,
        message: "Instrument key is required",
      });
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and To dates are required",
      });
    }

    const result = await runBacktest({
      userId,

      instrumentKey,

      unit,
      interval,

      from,
      to,

      initialCapital:
        Number(initialCapital),

      quantity:
        Number(quantity),

      strategyKey,

      smaPeriod:
        Number(smaPeriod),

      emaPeriod:
        Number(emaPeriod),

      rsiPeriod:
        Number(rsiPeriod),

      macdFastPeriod:
        Number(macdFastPeriod),

      macdSlowPeriod:
        Number(macdSlowPeriod),

      macdSignalPeriod:
        Number(macdSignalPeriod),
    });

    return res.status(200).json({
      success: true,
      message: "Backtest completed successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Run backtest error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to run backtest",
    });
  }
};

const getBacktestHistoryController = async (
  req,
  res,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      limit = 20,
      skip = 0,
    } = req.query;

    const result =
      await getBacktestHistory({
        userId,

        limit:
          Number(limit),

        skip:
          Number(skip),
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Get backtest history error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to fetch backtest history",
    });
  }
};

const getBacktestController = async (
  req,
  res,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const backtest =
      await getBacktestById({
        backtestId:
          req.params.backtestId,

        userId,
      });

    return res.status(200).json({
      success: true,
      data: {
        backtest,
      },
    });
  } catch (error) {
    console.error(
      "Get backtest error:",
      error,
    );

    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        "Backtest not found",
    });
  }
};

export {
  runBacktestController,
  getBacktestHistoryController,
  getBacktestController,
};