import { connectUpstoxMarketFeed } from "./upstoxWebSocket.client.js";

class MarketDataWebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;

    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.shouldReconnect = true;

    this.maxReconnectDelay = 30000;

    this.feedListeners = new Set();
  }

  addFeedListener(listener) {
    if (typeof listener !== "function") {
      throw new Error("Feed listener must be a function");
    }

    this.feedListeners.add(listener);

    return () => {
      this.feedListeners.delete(listener);
    };
  }

  notifyFeedListeners(normalizedData) {
    for (const listener of this.feedListeners) {
      try {
        listener(normalizedData);
      } catch (error) {
        console.error(
          "Market data feed listener error:",
          error.message,
        );
      }
    }
  }

  async connect() {
    if (this.isConnected && this.socket) {
      console.log(
        "Market Data WebSocket already connected",
      );

      return this.socket;
    }

    this.shouldReconnect = true;

    try {
      const socket = await connectUpstoxMarketFeed(
        (normalizedData) => {
          console.log(
            "Market Data Service received:",
            JSON.stringify(
              normalizedData,
              null,
              2,
            ),
          );

          this.notifyFeedListeners(normalizedData);
        },
      );

      this.socket = socket;
      this.isConnected = true;
      this.reconnectAttempts = 0;

      console.log(
        "TradeXen Market Data WebSocket connected",
      );

      socket.on("close", () => {
        this.isConnected = false;
        this.socket = null;

        console.log(
          "TradeXen Market Data WebSocket disconnected",
        );

        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      });

      return socket;
    } catch (error) {
      console.error(
        "Market Data WebSocket connection failed:",
        error.message,
      );

      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }

      throw error;
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts += 1;

    const delay = Math.min(
      2000 *
        2 ** (this.reconnectAttempts - 1),
      this.maxReconnectDelay,
    );

    console.log(
      `Reconnecting in ${delay / 1000}s...`,
    );

    this.reconnectTimer = setTimeout(
      async () => {
        this.reconnectTimer = null;

        try {
          await this.connect();
        } catch {
          // connect() already schedules
          // the next attempt
        }
      },
      delay,
    );
  }

  disconnect() {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (!this.socket) {
      this.isConnected = false;

      console.log(
        "Market Data WebSocket is already disconnected",
      );

      return;
    }

    this.socket.close();

    this.socket = null;
    this.isConnected = false;
  }

  getStatus() {
    return {
      connected: this.isConnected,
      readyState:
        this.socket?.readyState ?? null,
      reconnectAttempts:
        this.reconnectAttempts,
      listenerCount:
        this.feedListeners.size,
    };
  }
}

const marketDataWebSocketService =
  new MarketDataWebSocketService();

export default marketDataWebSocketService;