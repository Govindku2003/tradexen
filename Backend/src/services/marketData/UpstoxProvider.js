import MarketDataProvider from "./MarketDataProvider.js";

class UpstoxProvider extends MarketDataProvider {
  constructor() {
    super();

    this.accessToken = process.env.UPSTOX_ANALYTICS_TOKEN || "";
    this.baseUrl = "https://api.upstox.com/v2";
  }

  async getQuote(symbol) {
    if (!this.accessToken) {
      throw new Error("UPSTOX_ANALYTICS_TOKEN is not configured");
    }

    throw new Error(
      `Upstox quote integration is not connected yet for symbol: ${symbol}`
    );
  }

  async getHistoricalData(symbol, interval, from, to) {
    if (!this.accessToken) {
      throw new Error("UPSTOX_ANALYTICS_TOKEN is not configured");
    }

    throw new Error(
      `Upstox historical data integration is not connected yet for symbol: ${symbol}`
    );
  }

  async connectWebSocket() {
    if (!this.accessToken) {
      throw new Error("UPSTOX_ANALYTICS_TOKEN is not configured");
    }

    throw new Error("Upstox WebSocket integration is not connected yet");
  }

  async disconnectWebSocket() {
    return true;
  }
}

export default UpstoxProvider;