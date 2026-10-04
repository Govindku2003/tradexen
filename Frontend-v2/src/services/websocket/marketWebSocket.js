const getWebSocketUrl = () => {
  const configuredApiUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000/api";

  try {
    const apiUrl = new URL(configuredApiUrl);

    const protocol =
      apiUrl.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${apiUrl.host}/ws`;
  } catch {
    return "ws://localhost:5000/ws";
  }
};

const WS_URL = getWebSocketUrl();

let socket = null;
let reconnectTimer = null;
let reconnectDelay = 2000;

const listeners = new Set();

const notifyListeners = (message) => {
  listeners.forEach((listener) => {
    try {
      listener(message);
    } catch (error) {
      console.error(
        "Market WebSocket listener error:",
        error,
      );
    }
  });
};

const connectMarketWebSocket = () => {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  try {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log(
        "TradeXen frontend WebSocket connected",
      );

      reconnectDelay = 2000;

      notifyListeners({
        type: "connection",
        status: "connected",
      });
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        notifyListeners(message);
      } catch (error) {
        console.error(
          "Market WebSocket message parse error:",
          error,
        );
      }
    };

    socket.onerror = (error) => {
      console.error(
        "TradeXen frontend WebSocket error:",
        error,
      );

      notifyListeners({
        type: "connection",
        status: "error",
      });
    };

    socket.onclose = () => {
      socket = null;

      notifyListeners({
        type: "connection",
        status: "disconnected",
      });

      if (listeners.size === 0) {
        return;
      }

      clearTimeout(reconnectTimer);

      console.log(
        `Frontend WebSocket reconnecting in ${reconnectDelay / 1000}s...`,
      );

      reconnectTimer = setTimeout(() => {
        connectMarketWebSocket();

        reconnectDelay = Math.min(
          reconnectDelay * 2,
          30000,
        );
      }, reconnectDelay);
    };
  } catch (error) {
    console.error(
      "TradeXen frontend WebSocket connection error:",
      error,
    );
  }
};

const subscribeMarketWebSocket = (listener) => {
  if (typeof listener !== "function") {
    throw new Error(
      "WebSocket listener must be a function",
    );
  }

  listeners.add(listener);

  connectMarketWebSocket();

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      clearTimeout(reconnectTimer);
    }
  };
};

const disconnectMarketWebSocket = () => {
  clearTimeout(reconnectTimer);

  if (socket) {
    socket.close();
    socket = null;
  }

  listeners.clear();
};

export {
  subscribeMarketWebSocket,
  disconnectMarketWebSocket,
};