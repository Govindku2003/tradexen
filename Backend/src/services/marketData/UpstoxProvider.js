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

    const response = 
    await fetch(url, {
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

  async getHistoricalData(instrumentKey, unit, interval, from, to) {
    if (!this.accessToken) {
      throw new Error("UPSTOX_ANALYTICS_TOKEN is not configured");
    }

    if (!instrumentKey) {
      throw new Error("instrumentKey is required");
    }

    if (!unit) {
      throw new Error("unit is required");
    }

    if (!interval) {
      throw new Error("interval is required");
    }

    if (!to) {
      throw new Error("to date is required");
    }

    const encodedInstrumentKey = encodeURIComponent(instrumentKey);

    let url =
      `${this.baseUrl}/historical-candle/` +
      `${encodedInstrumentKey}/` +
      `${encodeURIComponent(unit)}/` +
      `${encodeURIComponent(interval)}/` +
      `${encodeURIComponent(to)}`;

    if (from) {
      url += `/${encodeURIComponent(from)}`;
    }

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
          `Upstox historical API request failed with status ${response.status}`,
      );
    }

    return data;
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
