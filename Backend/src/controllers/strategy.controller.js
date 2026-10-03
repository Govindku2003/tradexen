import {
  getHistoricalData,
} from "../services/marketData/marketData.service.js";

import {
  calculateIndicatorSeries,
} from "../services/indicators/indicator.service.js";

import {
  runStrategies,
} from "../services/strategies/strategy.engine.js";

import {
  getStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  toggleStrategy,
} from "../services/strategies/strategy.service.js";

const getStrategySignals = async (req, res) => {
  try {
    const {
      instrumentKey,
      unit = "days",
      interval = "1",
      from,
      to,
      smaPeriod = "20",
      emaPeriod = "20",
      fastEMAPeriod = "9",
      slowEMAPeriod = "21",
      rsiPeriod = "14",
      macdFastPeriod = "12",
      macdSlowPeriod = "26",
      macdSignalPeriod = "9",
    } = req.query;

    if (!instrumentKey) {
      return res.status(400).json({
        success: false,
        message: "instrumentKey is required",
      });
    }

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "to date is required",
      });
    }

    const candles = await getHistoricalData(
      instrumentKey,
      unit,
      interval,
      from,
      to,
    );

    if (!Array.isArray(candles) || !candles.length) {
      return res.status(404).json({
        success: false,
        message: "No historical candles found",
      });
    }

    const chronologicalCandles = [
      ...candles,
    ].reverse();

    const prices = chronologicalCandles.map(
      (candle) => Number(candle.close),
    );

    const indicatorSeries =
      calculateIndicatorSeries(prices, {
        smaPeriod: Number(smaPeriod),
        emaPeriod: Number(emaPeriod),
        fastEMAPeriod: Number(
          fastEMAPeriod,
        ),
        slowEMAPeriod: Number(
          slowEMAPeriod,
        ),
        rsiPeriod: Number(rsiPeriod),
        macdFastPeriod: Number(
          macdFastPeriod,
        ),
        macdSlowPeriod: Number(
          macdSlowPeriod,
        ),
        macdSignalPeriod: Number(
          macdSignalPeriod,
        ),
      });

    const latestIndex =
      chronologicalCandles.length - 1;

    const latestCandle =
      chronologicalCandles[latestIndex];

    const indicators = {
      sma:
        indicatorSeries.sma[latestIndex] ??
        null,

      ema:
        indicatorSeries.ema[latestIndex] ??
        null,

      fastEMA:
        indicatorSeries.fastEMA[
          latestIndex
        ] ?? null,

      slowEMA:
        indicatorSeries.slowEMA[
          latestIndex
        ] ?? null,

      rsi:
        indicatorSeries.rsi[latestIndex] ??
        null,

      macd:
        indicatorSeries.macd[latestIndex] ??
        null,
    };

    const strategyResult = runStrategies(
      {
        instrumentKey,
        price: latestCandle.close,
        timestamp: latestCandle.timestamp,
        candle: latestCandle,
      },
      indicators,
    );

    return res.status(200).json({
      success: true,
      data: {
        instrumentKey,
        marketData: {
          instrumentKey,
          price: latestCandle.close,
          timestamp: latestCandle.timestamp,
          candle: latestCandle,
        },
        indicators,
        strategies:
          strategyResult.strategies,
        decision:
          strategyResult.decision,
      },
    });
  } catch (error) {
    console.error(
      "Strategy signals error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to generate strategy signals",
    });
  }
};

const listStrategies = async (req, res) => {
  try {
    const strategies = await getStrategies(
      req.userId,
    );

    return res.json({
      success: true,
      data: strategies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createStrategyController = async (
  req,
  res,
) => {
  try {
    const strategy =
      await createStrategy(
        req.userId,
        req.body,
      );

    return res.status(201).json({
      success: true,
      data: strategy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateStrategyController = async (
  req,
  res,
) => {
  try {
    const strategy =
      await updateStrategy(
        req.userId,
        req.params.strategyId,
        req.body,
      );

    return res.json({
      success: true,
      data: strategy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteStrategyController = async (
  req,
  res,
) => {
  try {
    await deleteStrategy(
      req.userId,
      req.params.strategyId,
    );

    return res.json({
      success: true,
      message: "Strategy deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const toggleStrategyController = async (
  req,
  res,
) => {
  try {
    const strategy =
      await toggleStrategy(
        req.userId,
        req.params.strategyId,
      );

    return res.json({
      success: true,
      data: strategy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getStrategySignals,
  listStrategies,
  createStrategyController,
  updateStrategyController,
  deleteStrategyController,
  toggleStrategyController,
};