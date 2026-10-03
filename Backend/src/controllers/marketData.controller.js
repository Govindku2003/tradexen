import {
  getMarketQuote,
  getHistoricalData,
} from "../services/marketData/marketData.service.js";

import marketDataWebSocketService from "../services/marketData/marketDataWebSocket.service.js";

import {
  calculateIndicatorSeries,
} from "../services/indicators/indicator.service.js";

const getQuote = async (req, res) => {
  try {
    const instrumentKey =
      req.query.instrumentKey || "NSE_INDEX|Nifty 50";

    const quote = await getMarketQuote(instrumentKey);

    return res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error("Market quote error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch market quote",
    });
  }
};

const getHistoricalCandles = async (req, res) => {
  try {
    const {
      instrumentKey,
      unit = "minutes",
      interval = "5",
      from,
      to,
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

    const historicalData = await getHistoricalData(
      instrumentKey,
      unit,
      interval,
      from,
      to,
    );

    return res.status(200).json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    console.error("Historical market data error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to fetch historical market data",
    });
  }
};

const connectLiveMarketData = async (req, res) => {
  try {
    await marketDataWebSocketService.connect();

    return res.status(200).json({
      success: true,
      message: "Market data WebSocket connected",
      status: marketDataWebSocketService.getStatus(),
    });
  } catch (error) {
    console.error("Market WebSocket connection error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to connect market data WebSocket",
    });
  }
};

const getMarketIndicators = async (req, res) => {
  try {
    const {
      instrumentKey,
      unit = "minutes",
      interval = "5",
      from,
      to,
      smaPeriod = "20",
      emaPeriod = "20",
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

    if (!Array.isArray(candles) || candles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No historical candles found",
      });
    }

    /*
     * Upstox historical candles are returned
     * latest -> oldest.
     *
     * Technical indicators must be calculated
     * oldest -> latest.
     */
    const chronologicalCandles = [...candles].reverse();

    const prices = chronologicalCandles.map((candle) =>
      Number(candle.close),
    );

    if (prices.some((price) => !Number.isFinite(price))) {
      return res.status(500).json({
        success: false,
        message: "Invalid candle close price received",
      });
    }

    const indicators = calculateIndicatorSeries(prices, {
      smaPeriod: Number(smaPeriod),
      emaPeriod: Number(emaPeriod),
      rsiPeriod: Number(rsiPeriod),
      macdFastPeriod: Number(macdFastPeriod),
      macdSlowPeriod: Number(macdSlowPeriod),
      macdSignalPeriod: Number(macdSignalPeriod),
    });

    /*
     * Map the calculated indicator values
     * back to the original Upstox candle order.
     */
    const data = candles.map((candle, index) => {
      const chronologicalIndex =
        candles.length - 1 - index;

      return {
        ...candle,

        indicators: {
          sma: indicators.sma[chronologicalIndex],
          ema: indicators.ema[chronologicalIndex],
          rsi: indicators.rsi[chronologicalIndex],
          macd: indicators.macd[chronologicalIndex],
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        instrumentKey,
        unit,
        interval,
        candles: data,
      },
    });
  } catch (error) {
    console.error("Market indicators error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to calculate market indicators",
    });
  }
};

export {
  getQuote,
  getHistoricalCandles,
  getMarketIndicators,
  connectLiveMarketData,
};