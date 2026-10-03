import { getHistoricalData } from "../marketData/marketData.service.js";
import { calculateIndicatorSeries } from "../indicators/indicator.service.js";
import { runStrategies } from "../strategies/strategy.engine.js";
import strategyManager from "../strategies/strategy.manager.js";

const DEFAULT_INITIAL_CAPITAL = 100000;

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const normalizeCandles = (candles = []) => {
  return [...candles]
    .map((candle) => ({
      instrumentKey: candle.instrumentKey,
      timestamp: candle.timestamp,
      open: toNumber(candle.open),
      high: toNumber(candle.high),
      low: toNumber(candle.low),
      close: toNumber(candle.close),
      volume: toNumber(candle.volume),
    }))
    .filter((candle) => candle.timestamp && candle.close !== null)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

const calculateDrawdown = (equity, peakEquity) => {
  if (peakEquity <= 0) {
    return 0;
  }

  return ((peakEquity - equity) / peakEquity) * 100;
};

const runBacktest = async ({
  instrumentKey,
  unit = "days",
  interval = "1",
  from,
  to,
  initialCapital = DEFAULT_INITIAL_CAPITAL,
  quantity = 1,
  strategyKey = "all",

  smaPeriod = 20,
  emaPeriod = 20,
  rsiPeriod = 14,
  macdFastPeriod = 12,
  macdSlowPeriod = 26,
  macdSignalPeriod = 9,
}) => {
  if (!instrumentKey) {
    throw new Error("instrumentKey is required");
  }

  if (!from || !to) {
    throw new Error("from and to dates are required");
  }

  const startingCapital = toNumber(initialCapital) ?? DEFAULT_INITIAL_CAPITAL;

  const tradeQuantity = toNumber(quantity) ?? 1;

  if (startingCapital <= 0) {
    throw new Error("initialCapital must be greater than 0");
  }

  if (tradeQuantity <= 0) {
    throw new Error("quantity must be greater than 0");
  }

  /*
   * 1. Fetch REAL historical market data.
   */
  const historicalResponse = await getHistoricalData(
    instrumentKey,
    unit,
    interval,
    from,
    to,
  );

  const rawCandles =
    historicalResponse?.data ??
    historicalResponse?.candles ??
    historicalResponse;

  const candles = normalizeCandles(rawCandles);

  if (candles.length < 2) {
    throw new Error("Not enough historical candles for backtesting");
  }

  /*
   * 2. Extract chronological close prices.
   */
  const prices = candles.map((candle) => candle.close);

  /*
   * 3. Calculate indicator series for
   *    every historical candle.
   */
  const indicatorSeries = calculateIndicatorSeries(prices, {
    smaPeriod,
    emaPeriod,
    rsiPeriod,
    macdFastPeriod,
    macdSlowPeriod,
    macdSignalPeriod,
  });

  let cash = startingCapital;

  let position = null;

  const trades = [];

  const equityCurve = [];

  let peakEquity = startingCapital;

  let maxDrawdown = 0;

  /*
   * Keep the latest strategy result.
   *
   * This is useful when an open position
   * is closed automatically on the final
   * candle.
   */
  let lastStrategyResult = null;

  /*
   * 4. Walk through historical candles
   *    one by one.
   */
  for (let index = 0; index < candles.length; index += 1) {
    const candle = candles[index];

    /*
     * Indicator snapshot for
     * current candle.
     */
    const indicators = {
      sma: indicatorSeries.sma[index] ?? null,

      ema: indicatorSeries.ema[index] ?? null,

      fastEMA: indicatorSeries.fastEMA[index] ?? null,

      slowEMA: indicatorSeries.slowEMA[index] ?? null,

      rsi: indicatorSeries.rsi[index] ?? null,

      macd: indicatorSeries.macd[index] ?? null,
    };
    /*
     * Market snapshot expected by
     * existing strategy engine.
     */
    const marketData = {
      instrumentKey,
      price: candle.close,
      timestamp: candle.timestamp,
      candle,
    };

    /*
     * 5. Run EXISTING TradeXen
     *    strategy engine.
     */
   let strategyResult;

if (strategyKey === "all") {
  strategyResult = runStrategies(
    marketData,
    indicators
  );
} else {
  const selectedStrategy =
    strategyManager.generateSignal(
      strategyKey,
      marketData,
      indicators
    );

  strategyResult = {
    strategies: [selectedStrategy],
    decision: {
      finalSignal: selectedStrategy.signal,
      counts: {
        BUY:
          selectedStrategy.signal === "BUY"
            ? 1
            : 0,
        SELL:
          selectedStrategy.signal === "SELL"
            ? 1
            : 0,
        HOLD:
          selectedStrategy.signal === "HOLD"
            ? 1
            : 0,
      },
      hasConflict: false,
      validResults: [selectedStrategy],
      totalStrategies: 1,
    },
  };
}
    /*
     * Preserve the latest strategy
     * decision for forced exit.
     */
    lastStrategyResult = strategyResult;

    const decision = strategyResult?.decision;

    /*
     * signal.validator.js may expose
     * its result differently, therefore
     * support the existing common fields.
     */
    const signal =
      decision?.signal ?? decision?.decision ?? decision?.finalSignal ?? "HOLD";

    /*
     * 6. BUY
     *
     * LONG-only paper simulation.
     */
    if (signal === "BUY" && !position) {
      const cost = candle.close * tradeQuantity;

      if (cost <= cash) {
        position = {
          side: "LONG",

          quantity: tradeQuantity,

          entryPrice: candle.close,

          entryTime: candle.timestamp,

          entryIndex: index,

          entrySignal: signal,

          entryStrategies: strategyResult?.strategies ?? [],
        };

        cash -= cost;
      }
    }

    /*
     * 7. SELL
     *
     * SELL closes the existing LONG
     * position.
     */
    if (signal === "SELL" && position) {
      const exitPrice = candle.close;

      const proceeds = exitPrice * position.quantity;

      cash += proceeds;

      const pnl = (exitPrice - position.entryPrice) * position.quantity;

      const investedCapital = position.entryPrice * position.quantity;

      const returnPercent =
        investedCapital > 0 ? (pnl / investedCapital) * 100 : 0;

      trades.push({
        side: "LONG",

        quantity: position.quantity,

        entryPrice: position.entryPrice,

        exitPrice,

        entryTime: position.entryTime,

        exitTime: candle.timestamp,

        pnl,

        returnPercent,

        entrySignal: position.entrySignal,

        exitSignal: signal,

        strategies: strategyResult?.strategies ?? [],

        entryStrategies: position.entryStrategies ?? [],

        decision: strategyResult?.decision ?? null,
      });

      position = null;
    }

    /*
     * 8. Mark-to-market equity.
     */
    let equity = cash;

    if (position) {
      equity += position.quantity * candle.close;
    }

    peakEquity = Math.max(peakEquity, equity);

    const drawdown = calculateDrawdown(equity, peakEquity);

    maxDrawdown = Math.max(maxDrawdown, drawdown);

    equityCurve.push({
      timestamp: candle.timestamp,

      equity,

      drawdown,
    });
  }

  /*
   * 9. Close any open position
   *    at final historical candle.
   */
  if (position) {
    const finalCandle = candles[candles.length - 1];

    const exitPrice = finalCandle.close;

    const proceeds = exitPrice * position.quantity;

    cash += proceeds;

    const pnl = (exitPrice - position.entryPrice) * position.quantity;

    const investedCapital = position.entryPrice * position.quantity;

    const returnPercent =
      investedCapital > 0 ? (pnl / investedCapital) * 100 : 0;

    trades.push({
      side: "LONG",

      quantity: position.quantity,

      entryPrice: position.entryPrice,

      exitPrice,

      entryTime: position.entryTime,

      exitTime: finalCandle.timestamp,

      pnl,

      returnPercent,

      entrySignal: position.entrySignal,

      exitSignal: "FORCED_EXIT",

      /*
       * Preserve the strategy state
       * from the final candle instead
       * of returning an empty array.
       */
      strategies: lastStrategyResult?.strategies ?? [],

      entryStrategies: position.entryStrategies ?? [],

      decision: lastStrategyResult?.decision ?? null,
    });

    position = null;
  }

  /*
   * 10. Final statistics.
   */
  const finalEquity = cash;

  const totalPnL = finalEquity - startingCapital;

  const returnPercent =
    startingCapital > 0 ? (totalPnL / startingCapital) * 100 : 0;

  const winningTrades = trades.filter((trade) => trade.pnl > 0);

  const losingTrades = trades.filter((trade) => trade.pnl < 0);

  const winRate =
    trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;

  return {
    summary: {
      initialCapital: startingCapital,

      finalEquity,

      totalPnL,

      returnPercent,

      totalTrades: trades.length,

      winningTrades: winningTrades.length,

      losingTrades: losingTrades.length,

      winRate,

      maxDrawdown,
    },

    configuration: {
      instrumentKey,

      unit,

      interval,

      from,

      to,

      quantity: tradeQuantity,

      strategyKey,  

      indicators: {
        smaPeriod,
        emaPeriod,
        rsiPeriod,
        macdFastPeriod,
        macdSlowPeriod,
        macdSignalPeriod,
      },
    },

    trades,

    equityCurve,

    candlesProcessed: candles.length,
  };
};

export { runBacktest };
