import createMarketDataProvider from "./marketDataFactory.js";

const getMarketQuote = async (symbol) => {
  const provider = createMarketDataProvider();

  return provider.getQuote(symbol);
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
