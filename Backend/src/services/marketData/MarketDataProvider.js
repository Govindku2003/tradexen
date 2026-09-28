class MarketDataProvider {
  async getQuote(symbol) {
    throw new Error("getQuote() must be implemented by the provider");
  }

  async getHistoricalData(symbol, interval, from, to) {
    throw new Error("getHistoricalData() must be implemented by the provider");
  }

  async connectWebSocket() {
    throw new Error("connectWebSocket() must be implemented by the provider");
  }

  async disconnectWebSocket() {
    throw new Error(
      "disconnectWebSocket() must be implemented by the provider",
    );
  }
}

export default MarketDataProvider;
