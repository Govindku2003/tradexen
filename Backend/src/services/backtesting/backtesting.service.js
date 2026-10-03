import mongoose from "mongoose";

import Backtest from "../../models/Backtest.js";
import Strategy from "../../models/Strategy.js";

import { getHistoricalData } from "../marketData/marketData.service.js";
import { calculateIndicatorSeries } from "../indicators/indicator.service.js";
import { runStrategies } from "../strategies/strategy.engine.js";

const STRATEGY_NAME_MAP = {
  EMA_CROSSOVER: "Moving Average Strategy",
  "moving-average": "Moving Average Strategy",

  RSI: "RSI Strategy",
  rsi: "RSI Strategy",

  MACD: "MACD Strategy",
  macd: "MACD Strategy",
};

const normalizeDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return date;
};

const getSelectedStrategy = async ({
  userId,
  strategyKey,
}) => {
  if (
    !strategyKey ||
    strategyKey === "all" ||
    strategyKey === "ALL"
  ) {
    return null;
  }

  if (mongoose.Types.ObjectId.isValid(strategyKey)) {
    const strategy = await Strategy.findOne({
      _id: strategyKey,
      user: userId,
    }).lean();

    if (!strategy) {
      throw new Error("Selected strategy not found");
    }

    return strategy;
  }

  const strategyName =
    STRATEGY_NAME_MAP[strategyKey];

  if (!strategyName) {
    throw new Error(
      `Unsupported strategy: ${strategyKey}`,
    );
  }

  const strategy = await Strategy.findOne({
    user: userId,
    name: strategyName,
  }).lean();

  return strategy || null;
};

const getStrategySignal = ({
  strategyKey,
  strategies,
  decision,
}) => {
  if (
    !strategyKey ||
    strategyKey === "all" ||
    strategyKey === "ALL"
  ) {
    return decision?.finalSignal || "HOLD";
  }

  const targetName =
    STRATEGY_NAME_MAP[strategyKey];

  const selected = strategies.find(
    (item) =>
      item.strategy === targetName,
  );

  return selected?.signal || "HOLD";
};

const getStrategyReason = ({
  strategyKey,
  strategies,
  decision,
}) => {
  if (
    !strategyKey ||
    strategyKey === "all" ||
    strategyKey === "ALL"
  ) {
    return (
      decision?.reason ||
      "Combined strategy decision"
    );
  }

  const targetName =
    STRATEGY_NAME_MAP[strategyKey];

  const selected = strategies.find(
    (item) =>
      item.strategy === targetName,
  );

  return (
    selected?.reason ||
    "Strategy signal generated"
  );
};

const runBacktest = async ({
  userId,

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
}) => {
  if (!userId) {
    throw new Error(
      "User authentication is required",
    );
  }

  if (!instrumentKey) {
    throw new Error(
      "Instrument key is required",
    );
  }

  const startDate = normalizeDate(from);
  const endDate = normalizeDate(to);

  if (startDate >= endDate) {
    throw new Error(
      "From date must be before To date",
    );
  }

  const capital = Number(initialCapital);
  const tradeQuantity = Number(quantity);

  if (
    !Number.isFinite(capital) ||
    capital <= 0
  ) {
    throw new Error(
      "Initial capital must be greater than zero",
    );
  }

  if (
    !Number.isFinite(tradeQuantity) ||
    tradeQuantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than zero",
    );
  }

  const selectedStrategy =
    await getSelectedStrategy({
      userId,
      strategyKey,
    });

  const strategyId =
    selectedStrategy?._id ?? null;

  const symbol =
    instrumentKey.includes("|")
      ? instrumentKey.split("|").pop()
      : instrumentKey;

  let backtest;

  try {
    backtest = await Backtest.create({
      user: userId,

      strategy: strategyId,

      strategyKey:
        strategyKey || "all",

      name: `Backtest - ${symbol}`,

      symbol: symbol.toUpperCase(),

      instrumentKey,

      exchange: "NSE",

      unit,
      interval,

      startDate,
      endDate,

      initialCapital: capital,

      finalCapital: capital,

      totalReturn: 0,

      totalReturnPercent: 0,

      totalTrades: 0,

      winningTrades: 0,

      losingTrades: 0,

      winRate: 0,

      maxDrawdown: 0,

      quantity: tradeQuantity,

      configuration: {
        strategyKey:
          strategyKey || "all",

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
      },

      trades: [],

      equityCurve: [],

      candlesProcessed: 0,

      status: "RUNNING",

      errorMessage: null,

      completedAt: null,
    });

    /*
     * Historical market data
     */
    const candles =
      await getHistoricalData(
        instrumentKey,
        unit,
        interval,
        from,
        to,
      );

    if (
      !Array.isArray(candles) ||
      candles.length === 0
    ) {
      throw new Error(
        "No historical market data available for the selected period",
      );
    }

    /*
     * Historical API data is normally
     * newest first.
     */
    const chronological =
      [...candles].reverse();

    const prices =
      chronological.map((candle) =>
        Number(candle.close),
      );

    /*
     * Calculate indicators once.
     */
    const indicators =
      calculateIndicatorSeries(
        prices,
        {
          smaPeriod:
            Number(smaPeriod),

          emaPeriod:
            Number(emaPeriod),

          fastEMAPeriod: 9,

          slowEMAPeriod: 21,

          rsiPeriod:
            Number(rsiPeriod),

          macdFastPeriod:
            Number(macdFastPeriod),

          macdSlowPeriod:
            Number(macdSlowPeriod),

          macdSignalPeriod:
            Number(macdSignalPeriod),
        },
      );

    /*
     * Virtual portfolio
     */
    let cash = capital;

    let positionQuantity = 0;

    let positionEntryPrice = 0;

    let positionEntryTime = null;

    let positionEntryReason = "";

    let realizedPnL = 0;

    let peakEquity = capital;

    let maxDrawdownPercent = 0;

    /*
     * Completed trades only.
     *
     * BUY + SELL becomes one trade.
     */
    const trades = [];

    const equityCurve = [];

    /*
     * Process candles chronologically.
     */
    for (
      let index = 0;
      index < chronological.length;
      index += 1
    ) {
      const candle =
        chronological[index];

      const price =
        Number(candle.close);

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        continue;
      }

      const latestIndicators = {
        sma:
          indicators.sma?.[index] ??
          null,

        ema:
          indicators.ema?.[index] ??
          null,

        fastEMA:
          indicators.fastEMA?.[index] ??
          null,

        slowEMA:
          indicators.slowEMA?.[index] ??
          null,

        rsi:
          indicators.rsi?.[index] ??
          null,

        macd:
          indicators.macd?.[index] ??
          null,
      };

      const marketData = {
        instrumentKey,

        price,

        timestamp:
          candle.timestamp,

        candle,
      };

      const strategyResult =
        runStrategies(
          marketData,
          latestIndicators,
        );

      const signal =
        getStrategySignal({
          strategyKey:
            strategyKey || "all",

          strategies:
            strategyResult?.strategies ||
            [],

          decision:
            strategyResult?.decision,
        });

      const reason =
        getStrategyReason({
          strategyKey:
            strategyKey || "all",

          strategies:
            strategyResult?.strategies ||
            [],

          decision:
            strategyResult?.decision,
        });

      /*
       * BUY
       */
      if (
        signal === "BUY" &&
        positionQuantity === 0
      ) {
        const requiredCapital =
          price * tradeQuantity;

        if (
          requiredCapital <= cash
        ) {
          cash -= requiredCapital;

          positionQuantity =
            tradeQuantity;

          positionEntryPrice =
            price;

          positionEntryTime =
            candle.timestamp;

          positionEntryReason =
            reason;
        }
      }

      /*
       * SELL
       *
       * Convert the open BUY position
       * into one completed trade.
       */
      if (
        signal === "SELL" &&
        positionQuantity > 0
      ) {
        const sellQuantity =
          Math.min(
            tradeQuantity,
            positionQuantity,
          );

        const entryPrice =
          positionEntryPrice;

        const exitPrice =
          price;

        const entryValue =
          entryPrice * sellQuantity;

        const exitValue =
          exitPrice * sellQuantity;

        const tradePnL =
          exitValue -
          entryValue;

        const tradeReturnPercent =
          entryValue > 0
            ? (tradePnL /
                entryValue) *
              100
            : 0;

        cash += exitValue;

        positionQuantity -=
          sellQuantity;

        realizedPnL +=
          tradePnL;

        trades.push({
          side: "LONG",

          quantity:
            sellQuantity,

          entryPrice,

          exitPrice,

          entryTime:
            positionEntryTime,

          exitTime:
            candle.timestamp,

          pnl: tradePnL,

          returnPercent:
            tradeReturnPercent,

          signal,

          entryReason:
            positionEntryReason,

          exitReason:
            reason ||
            "SELL signal",
        });

        if (
          positionQuantity === 0
        ) {
          positionEntryPrice = 0;
          positionEntryTime = null;
          positionEntryReason = "";
        }
      }

      /*
       * Mark-to-market equity
       */
      const positionValue =
        positionQuantity *
        price;

      const equity =
        cash + positionValue;

      if (
        equity > peakEquity
      ) {
        peakEquity = equity;
      }

      /*
       * Correct percentage drawdown.
       *
       * Example:
       * Peak = 100000
       * Current = 99950
       * Drawdown = 0.05%
       */
      const drawdownPercent =
        peakEquity > 0
          ? ((peakEquity - equity) /
              peakEquity) *
            100
          : 0;

      if (
        drawdownPercent >
        maxDrawdownPercent
      ) {
        maxDrawdownPercent =
          drawdownPercent;
      }

      equityCurve.push({
        timestamp:
          candle.timestamp,

        price,

        cash,

        positionQuantity,

        positionValue,

        equity,

        drawdownPercent,
      });
    }

    /*
     * Force close final position.
     *
     * This creates a proper completed
     * LONG trade instead of a raw SELL leg.
     */
    if (
      positionQuantity > 0
    ) {
      const finalCandle =
        chronological[
          chronological.length - 1
        ];

      const finalPrice =
        Number(
          finalCandle.close,
        );

      const entryPrice =
        positionEntryPrice;

      const exitPrice =
        finalPrice;

      const entryValue =
        entryPrice *
        positionQuantity;

      const exitValue =
        exitPrice *
        positionQuantity;

      const tradePnL =
        exitValue -
        entryValue;

      const tradeReturnPercent =
        entryValue > 0
          ? (tradePnL /
              entryValue) *
            100
          : 0;

      cash += exitValue;

      realizedPnL +=
        tradePnL;

      trades.push({
        side: "LONG",

        quantity:
          positionQuantity,

        entryPrice,

        exitPrice,

        entryTime:
          positionEntryTime,

        exitTime:
          finalCandle.timestamp,

        pnl: tradePnL,

        returnPercent:
          tradeReturnPercent,

        signal: "SELL",

        entryReason:
          positionEntryReason,

        exitReason:
          "Backtest final position close",
      });

      positionQuantity = 0;

      positionEntryPrice = 0;

      positionEntryTime = null;

      positionEntryReason = "";
    }

    /*
     * Final portfolio value
     */
    const finalCapital =
      Number(cash);

    const totalReturn =
      finalCapital - capital;

    const totalReturnPercent =
      capital > 0
        ? (totalReturn / capital) *
          100
        : 0;

    /*
     * Completed trade statistics
     */
    const totalTrades =
      trades.length;

    const winningTrades =
      trades.filter(
        (trade) =>
          Number(trade.pnl || 0) > 0,
      ).length;

    const losingTrades =
      trades.filter(
        (trade) =>
          Number(trade.pnl || 0) < 0,
      ).length;

    const winRate =
      totalTrades > 0
        ? (winningTrades /
            totalTrades) *
          100
        : 0;

    /*
     * Update database
     */
    backtest.finalCapital =
      finalCapital;

    backtest.totalReturn =
      totalReturn;

    backtest.totalReturnPercent =
      totalReturnPercent;

    backtest.totalTrades =
      totalTrades;

    backtest.winningTrades =
      winningTrades;

    backtest.losingTrades =
      losingTrades;

    backtest.winRate =
      winRate;

    backtest.maxDrawdown =
      maxDrawdownPercent;

    backtest.trades =
      trades;

    backtest.equityCurve =
      equityCurve;

    backtest.candlesProcessed =
      chronological.length;

    backtest.status =
      "COMPLETED";

    backtest.errorMessage =
      null;

    backtest.completedAt =
      new Date();

    await backtest.save();

    /*
     * Frontend-compatible response
     */
    return {
      configuration: {
        instrumentKey,

        unit,

        interval,

        from,

        to,

        initialCapital:
          capital,

        quantity:
          tradeQuantity,

        strategy:
          strategyKey || "all",

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
      },

      candlesProcessed:
        chronological.length,

      summary: {
        initialCapital:
          capital,

        finalEquity:
          finalCapital,

        finalCapital,

        totalPnL:
          totalReturn,

        totalReturn,

        returnPercent:
          totalReturnPercent,

        totalReturnPercent,

        totalTrades,

        winningTrades,

        losingTrades,

        winRate,

        maxDrawdown:
          maxDrawdownPercent,

        strategy:
          strategyKey || "all",
      },

      trades,

      equityCurve,

      backtest,
    };
  } catch (error) {
    if (backtest) {
      backtest.status =
        "FAILED";

      backtest.errorMessage =
        error.message;

      backtest.completedAt =
        new Date();

      await backtest.save();
    }

    throw error;
  }
};

const getBacktestHistory = async ({
  userId,
  limit = 20,
  skip = 0,
}) => {
  const safeLimit = Math.min(
    Math.max(
      Number(limit) || 20,
      1,
    ),
    100,
  );

  const safeSkip = Math.max(
    Number(skip) || 0,
    0,
  );

  const query = {
    user: userId,
  };

  const [
    backtests,
    total,
  ] = await Promise.all([
    Backtest.find(query)
      .populate(
        "strategy",
        "name strategyType",
      )
      .sort({
        createdAt: -1,
      })
      .skip(safeSkip)
      .limit(safeLimit)
      .lean(),

    Backtest.countDocuments(
      query,
    ),
  ]);

  return {
    backtests,

    pagination: {
      total,

      limit:
        safeLimit,

      skip:
        safeSkip,

      hasMore:
        safeSkip +
          backtests.length <
        total,
    },
  };
};

const getBacktestById = async ({
  backtestId,
  userId,
}) => {
  if (!backtestId) {
    throw new Error(
      "Backtest ID is required",
    );
  }

  const backtest =
    await Backtest.findOne({
      _id: backtestId,
      user: userId,
    })
      .populate(
        "strategy",
        "name strategyType",
      )
      .lean();

  if (!backtest) {
    throw new Error(
      "Backtest not found",
    );
  }

  return backtest;
};

export {
  runBacktest,
  getBacktestHistory,
  getBacktestById,
};