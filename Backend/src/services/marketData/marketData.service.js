import createMarketDataProvider from "./marketDataFactory.js";
import {
  normalizeMarketQuote,
  normalizeHistoricalCandles,
} from "./marketDataNormalizer.js";

const getMarketQuote = async (instrumentKey) => {
  const provider = createMarketDataProvider();

  const rawQuote = await provider.getQuote(instrumentKey);

  return normalizeMarketQuote(rawQuote, instrumentKey);
};

const getHistoricalData = async (instrumentKey, unit, interval, from, to) => {
  const provider = createMarketDataProvider();

  const rawHistoricalData = await provider.getHistoricalData(
    instrumentKey,
    unit,
    interval,
    from,
    to,
  );

  return normalizeHistoricalCandles(rawHistoricalData, instrumentKey);
};

const connectMarketDataWebSocket = async () => {
  const provider = createMarketDataProvider();

  return provider.connectWebSocket();
};

const disconnectMarketDataWebSocket = async () => {
  const provider = createMarketDataProvider();

  return provider.disconnectWebSocket();
};

export {
  getMarketQuote,
  getHistoricalData,
  connectMarketDataWebSocket,
  disconnectMarketDataWebSocket,
};
