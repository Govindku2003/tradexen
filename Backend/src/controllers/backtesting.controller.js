import { runBacktest } from "../services/backtesting/backtesting.service.js";

const runBacktestController = async (req, res) => {
  try {
    const {
      instrumentKey,
      unit = "days",
      interval = "1",
      from,
      to,
      initialCapital = 100000,
      quantity = 1,
      strategyKey = "all",

      smaPeriod = 20,
      emaPeriod = 20,
      rsiPeriod = 14,
      macdFastPeriod = 12,
      macdSlowPeriod = 26,
      macdSignalPeriod = 9,
    } = req.body;

    if (!instrumentKey) {
      return res.status(400).json({
        success: false,
        message: "instrumentKey is required",
      });
    }

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required",
      });
    }

    const result = await runBacktest({
      instrumentKey,
      unit,
      interval,
      from,
      to,
      initialCapital,
      quantity,
      strategyKey,
      smaPeriod,
      emaPeriod,
      rsiPeriod,
      macdFastPeriod,
      macdSlowPeriod,
      macdSignalPeriod,
    });

    return res.status(200).json({
      success: true,
      message: "Backtest completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Backtesting error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to run backtest",
    });
  }
};

export { runBacktestController };
