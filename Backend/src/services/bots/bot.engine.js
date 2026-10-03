import Bot from "../../models/Bot.js";
import BotSignal from "../../models/BotSignal.js";
import Strategy from "../../models/Strategy.js";
import ActivityLog from "../../models/ActivityLog.js";
import TradingAccount from "../../models/TradingAccount.js";

import {
  getHistoricalData,
} from "../marketData/marketData.service.js";

import {
  calculateIndicatorSeries,
} from "../indicators/indicator.service.js";

import {
  runStrategies,
} from "../strategies/strategy.engine.js";

import {
  createOrder,
} from "../orders/order.service.js";

import {
  executeOrder,
} from "../orders/order.execution.service.js";

import {
  getOpenPosition,
} from "../positions/position.service.js";

const runningBots = new Map();

const strategyNameMap = {
  EMA_CROSSOVER: "Moving Average Strategy",
  RSI: "RSI Strategy",
  MACD: "MACD Strategy",
};

const getSignalForStrategy = (
  strategies,
  strategyType,
) => {
  const targetName = strategyNameMap[strategyType];

  return (
    strategies.find(
      (item) =>
        item.strategy === targetName,
    ) || {
      signal: "HOLD",
      reason:
        "Selected strategy result not available",
      indicators: {},
    }
  );
};

const logBotActivity = async ({
  bot,
  action,
  description,
  level = "INFO",
  metadata = {},
}) => {
  await ActivityLog.create({
    user: bot.user,
    action,
    category: "BOT",
    description,
    level,
    metadata,
  });
};

/*
|--------------------------------------------------------------------------
| Analyze Bot
|--------------------------------------------------------------------------
*/
const analyzeBot = async (botId) => {
  const bot = await Bot.findById(botId);

  if (!bot) {
    throw new Error("Bot not found");
  }

  const strategy = await Strategy.findOne({
    _id: bot.strategy,
    user: bot.user,
  });

  if (!strategy) {
    throw new Error("Bot strategy not found");
  }

  if (!bot.instrumentKey) {
    throw new Error(
      "Bot instrument key is required",
    );
  }

  const now = new Date();

  const to = now
    .toISOString()
    .split("T")[0];

  const fromDate = new Date(now);

  fromDate.setDate(
    fromDate.getDate() - 2,
  );

  const from = fromDate
    .toISOString()
    .split("T")[0];

  const candles =
    await getHistoricalData(
      bot.instrumentKey,
      "minutes",
      bot.timeframe,
      from,
      to,
    );

  if (
    !Array.isArray(candles) ||
    candles.length === 0
  ) {
    throw new Error(
      "No market candles available",
    );
  }

  const chronological = [
    ...candles,
  ].reverse();

  const prices = chronological.map(
    (candle) =>
      Number(candle.close),
  );

  const parameters =
    strategy.parameters || {};

  const indicators =
    calculateIndicatorSeries(
      prices,
      {
        smaPeriod:
          Number(
            parameters.smaPeriod || 20,
          ),

        emaPeriod:
          Number(
            parameters.emaPeriod || 20,
          ),

        fastEMAPeriod:
          Number(
            parameters.fastEMAPeriod || 9,
          ),

        slowEMAPeriod:
          Number(
            parameters.slowEMAPeriod || 21,
          ),

        rsiPeriod:
          Number(
            parameters.rsiPeriod || 14,
          ),

        macdFastPeriod:
          Number(
            parameters.macdFastPeriod || 12,
          ),

        macdSlowPeriod:
          Number(
            parameters.macdSlowPeriod || 26,
          ),

        macdSignalPeriod:
          Number(
            parameters.macdSignalPeriod || 9,
          ),
      },
    );

  const latestIndex =
    chronological.length - 1;

  const latestCandle =
    chronological[latestIndex];

  const latestIndicators = {
    sma:
      indicators.sma[latestIndex] ??
      null,

    ema:
      indicators.ema[latestIndex] ??
      null,

    fastEMA:
      indicators.fastEMA[
        latestIndex
      ] ?? null,

    slowEMA:
      indicators.slowEMA[
        latestIndex
      ] ?? null,

    rsi:
      indicators.rsi[latestIndex] ??
      null,

    macd:
      indicators.macd[latestIndex] ??
      null,
  };

  const result = runStrategies(
    {
      instrumentKey:
        bot.instrumentKey,

      price:
        Number(
          latestCandle.close,
        ),

      timestamp:
        latestCandle.timestamp,

      candle: latestCandle,
    },
    latestIndicators,
  );

  const selectedSignal =
    getSignalForStrategy(
      result.strategies,
      strategy.strategyType,
    );

  return {
    bot,
    strategy,

    price:
      Number(
        latestCandle.close,
      ),

    timestamp:
      latestCandle.timestamp,

    indicators:
      latestIndicators,

    signal:
      selectedSignal.signal,

    reason:
      selectedSignal.reason,

    strategyResult:
      selectedSignal,

    decision:
      result.decision,
  };
};

/*
|--------------------------------------------------------------------------
| Execute Bot Signal
|--------------------------------------------------------------------------
*/
const executeBotSignal = async ({
  analysis,
}) => {
  const {
    bot,
    strategy,
    price,
    signal,
  } = analysis;

  if (signal === "HOLD") {
    bot.lastProcessedSignal = null;

    await bot.save();

    return {
      executed: false,
      reason: "HOLD signal",
    };
  }

  if (
    signal === "BUY" &&
    !bot.settings.allowBuy
  ) {
    return {
      executed: false,
      reason:
        "BUY is disabled for this bot",
    };
  }

  if (
    signal === "SELL" &&
    !bot.settings.allowSell
  ) {
    return {
      executed: false,
      reason:
        "SELL is disabled for this bot",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Resolve Active Trading Account
  |--------------------------------------------------------------------------
  */

  const account =
    await TradingAccount.findOne({
      user: bot.user,
      status: "active",
    });

  if (!account) {
    throw new Error(
      "Active trading account not found",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Prevent Duplicate Signal Execution
  |--------------------------------------------------------------------------
  */

  if (
    bot.lastProcessedSignal === signal
  ) {
    return {
      executed: false,
      reason:
        "Signal already processed",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | SELL Position Validation
  |--------------------------------------------------------------------------
  */

  if (signal === "SELL") {
    const position =
      await getOpenPosition({
        userId: bot.user,
        tradingAccountId:
          account._id,
        symbol: bot.symbol,
      }).catch(() => null);

    if (!position) {
      bot.lastProcessedSignal =
        "SELL";

      await bot.save();

      return {
        executed: false,
        reason:
          "No open position available for SELL",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Stop Loss / Take Profit
  |--------------------------------------------------------------------------
  */

  let stopLoss = null;
  let takeProfit = null;

  if (signal === "BUY") {
    const slPercent =
      Number(
        bot.settings.stopLossPercent || 0,
      );

    const tpPercent =
      Number(
        bot.settings.takeProfitPercent || 0,
      );

    if (slPercent > 0) {
      stopLoss =
        price *
        (1 - slPercent / 100);
    }

    if (tpPercent > 0) {
      takeProfit =
        price *
        (1 + tpPercent / 100);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Create BOT Order
  |--------------------------------------------------------------------------
  */

  const order =
    await createOrder({
      userId: bot.user,

      tradingAccountId:
        account._id,

      symbol: bot.symbol,

      side: signal,

      orderType: "MARKET",

      quantity:
        Number(bot.quantity),

      requestedPrice: price,

      stopLoss,

      takeProfit,

      source: "BOT",

      strategy:
        strategy._id,

      bot: bot._id,
    });

  /*
  |--------------------------------------------------------------------------
  | Execute Paper Order
  |--------------------------------------------------------------------------
  */

  const execution =
    await executeOrder(
      order._id,
    );

  /*
  |--------------------------------------------------------------------------
  | Update Bot Statistics
  |--------------------------------------------------------------------------
  */

  bot.lastProcessedSignal =
    signal;

  bot.totalOrders =
    Number(bot.totalOrders || 0) + 1;

  if (execution?.trade) {
    bot.totalTrades =
      Number(bot.totalTrades || 0) + 1;
  }

  await bot.save();

  return {
    executed: true,

    order:
      execution.order,

    trade:
      execution.trade,
  };
};

/*
|--------------------------------------------------------------------------
| Run Bot Cycle
|--------------------------------------------------------------------------
*/
const runBotCycle = async (
  botId,
) => {
  const bot =
    await Bot.findById(botId);

  if (
    !bot ||
    bot.status !== "RUNNING"
  ) {
    return;
  }

  try {
    const analysis =
      await analyzeBot(
        botId,
      );

    bot.lastSignal =
      analysis.signal;

    bot.lastSignalAt =
      new Date();

    bot.lastPrice =
      analysis.price;

    bot.lastAnalysisAt =
      new Date();

    bot.totalSignals =
      Number(
        bot.totalSignals || 0,
      ) + 1;

    bot.errorMessage =
      null;

    await bot.save();

    const signalRecord =
      await BotSignal.create({
        bot: bot._id,

        user: bot.user,

        strategy:
          analysis.strategy._id,

        symbol:
          bot.symbol,

        instrumentKey:
          bot.instrumentKey,

        signal:
          analysis.signal,

        price:
          analysis.price,

        reason:
          analysis.reason,

        indicators:
          analysis.indicators,
      });

    await logBotActivity({
      bot,

      action:
        "BOT_SIGNAL_GENERATED",

      description:
        `${analysis.signal} signal generated for ${bot.symbol}`,

      level:
        analysis.signal === "HOLD"
          ? "INFO"
          : "SUCCESS",

      metadata: {
        botId:
          bot._id,

        signalId:
          signalRecord._id,

        signal:
          analysis.signal,

        price:
          analysis.price,

        reason:
          analysis.reason,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | AUTO Execution
    |--------------------------------------------------------------------------
    */

    if (
      bot.controlMode === "AUTO" &&
      bot.settings.autoExecute
    ) {
      try {
        const execution =
          await executeBotSignal({
            analysis,
          });

        if (
          execution.executed
        ) {
          signalRecord.executed =
            true;

          signalRecord.order =
            execution.order?._id ??
            null;

          signalRecord.executionMessage =
            "BOT order executed";

          await signalRecord.save();

          await logBotActivity({
            bot,

            action:
              "BOT_ORDER_EXECUTED",

            description:
              `${analysis.signal} order executed automatically`,

            level:
              "SUCCESS",

            metadata: {
              orderId:
                execution.order?._id,

              tradeId:
                execution.trade?._id,
            },
          });
        }
      } catch (error) {
        signalRecord.executionMessage =
          error.message;

        await signalRecord.save();

        await logBotActivity({
          bot,

          action:
            "BOT_ORDER_ERROR",

          description:
            error.message,

          level:
            "ERROR",
        });
      }
    }

    return analysis;
  } catch (error) {
    const failedBot =
      await Bot.findById(
        botId,
      );

    if (failedBot) {
      failedBot.status =
        "ERROR";

      failedBot.errorMessage =
        error.message;

      await failedBot.save();

      await logBotActivity({
        bot: failedBot,

        action:
          "BOT_ANALYSIS_ERROR",

        description:
          error.message,

        level:
          "ERROR",
      });
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Start Bot Engine
|--------------------------------------------------------------------------
*/
const startBotEngine = async (
  botId,
) => {
  const key =
    botId.toString();

  if (
    runningBots.has(key)
  ) {
    return;
  }

  /*
  Initial cycle only works when
  the Bot is already RUNNING.
  The controller must change the
  status before calling this function.
  */

  await runBotCycle(
    botId,
  ).catch((error) =>
    console.error(
      "Initial bot cycle error:",
      error.message,
    ),
  );

  const interval =
    setInterval(
      async () => {
        try {
          await runBotCycle(
            botId,
          );
        } catch (error) {
          console.error(
            `Bot ${botId} cycle error:`,
            error.message,
          );
        }
      },
      15000,
    );

  runningBots.set(
    key,
    interval,
  );
};

/*
|--------------------------------------------------------------------------
| Stop Bot Engine
|--------------------------------------------------------------------------
*/
const stopBotEngine = (
  botId,
) => {
  const key =
    botId.toString();

  const interval =
    runningBots.get(key);

  if (interval) {
    clearInterval(
      interval,
    );

    runningBots.delete(
      key,
    );
  }
};

/*
|--------------------------------------------------------------------------
| Engine Status
|--------------------------------------------------------------------------
*/
const getEngineStatus = (
  botId,
) => {
  return runningBots.has(
    botId.toString(),
  );
};

/*
|--------------------------------------------------------------------------
| Resume Running Bots
|--------------------------------------------------------------------------
*/
const resumeRunningBots =
  async () => {
    const bots =
      await Bot.find({
        status: "RUNNING",
      });

    for (const bot of bots) {
      await startBotEngine(
        bot._id,
      );
    }
  };

export {
  analyzeBot,
  startBotEngine,
  stopBotEngine,
  getEngineStatus,
  resumeRunningBots,
};