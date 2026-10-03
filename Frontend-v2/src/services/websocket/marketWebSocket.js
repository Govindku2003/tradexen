const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://localhost:5000/ws";

let socket = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

const listeners = new Set();

const MAX_RECONNECT_DELAY = 30000;

const notifyListeners = (data) => {
  listeners.forEach((listener) => {
    try {
      listener(data);
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
    (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    )
  ) {
    return;
  }

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log(
      "TradeXen frontend WebSocket connected",
    );

    reconnectAttempts = 0;

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
  };

  socket.onclose = () => {
    socket = null;

    notifyListeners({
      type: "connection",
      status: "disconnected",
    });

    scheduleReconnect();
  };
};

const scheduleReconnect = () => {
  if (reconnectTimer) {
    return;
  }

  reconnectAttempts += 1;

  const delay = Math.min(
    2000 *
      2 ** (reconnectAttempts - 1),
    MAX_RECONNECT_DELAY,
  );

  console.log(
    `Frontend WebSocket reconnecting in ${
      delay / 1000
    }s...`,
  );

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;

    connectMarketWebSocket();
  }, delay);
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
  };
};

const disconnectMarketWebSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  reconnectAttempts = 0;

  if (socket) {
    socket.close();
    socket = null;
  }
};

export {
  subscribeMarketWebSocket,
  disconnectMarketWebSocket,
};