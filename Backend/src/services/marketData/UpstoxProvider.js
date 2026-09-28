import MarketDataProvider from "./MarketDataProvider.js";

class UpstoxProvider extends MarketDataProvider {
  constructor() {
    super();

    this.accessToken = process.env.UPSTOX_ANALYTICS_TOKEN || "";

    this.baseUrl = "https://api.upstox.com/v3";
  }

  async getQuote(instrumentKey) {
    if (!this.accessToken) {
      throw new Error("UPSTOX_ANALYTICS_TOKEN is not configured");
    }

    if (!instrumentKey) {
      throw new Error("instrumentKey is required");
    }

    const url = `${this.baseUrl}/market-quote/quotes?instrument_key=${encodeURIComponent(
      instrumentKey,
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.errors?.[0]?.message ||
          data?.message ||
          `Upstox API request failed with status ${response.status}`,
      );
    }

    return data;
  }

  async getHistoricalData(symbol, interval, from, to) {
    if (!this.accessToken) {
      throw new Error("UPSTOX_ANALYTICS_TOKEN is not configured");
    }

    throw new Error(
      `Upstox historical data integration is not connected yet for symbol: ${symbol}`,
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
