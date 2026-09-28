import createMarketDataProvider from "./marketDataFactory.js";
import { normalizeMarketQuote } from "./marketDataNormalizer.js";

const getMarketQuote = async (instrumentKey) => {
  const provider = createMarketDataProvider();

  const rawQuote = await provider.getQuote(instrumentKey);

  return normalizeMarketQuote(rawQuote, instrumentKey);
};

const getHistoricalData = async (symbol, interval, from, to) => {
  const provider = createMarketDataProvider();

  return provider.getHistoricalData(symbol, interval, from, to);
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
