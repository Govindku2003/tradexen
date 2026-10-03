import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";
import { WebSocketServer } from "ws";
import marketDataWebSocketService from "./services/marketData/marketDataWebSocket.service.js";
import {
  resumeRunningBots,
} from "./services/bots/bot.engine.js";

const startServer = async () => {
  await connectDB();
  await connectDB();

await resumeRunningBots();

  const server = app.listen(env.port, () => {
    console.log(`
╔══════════════════════════════════════╗
║          TradeXen API                ║
╠══════════════════════════════════════╣
║ Environment : ${env.nodeEnv.padEnd(20)}║
║ Port        : ${String(env.port).padEnd(20)}║
║ Status      : Server running         ║
╚══════════════════════════════════════╝
    `);
  });

  const wss = new WebSocketServer({
    noServer: true,
  });

  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`)
      .pathname;

    if (pathname !== "/ws") {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (socket) => {
    console.log("TradeXen frontend WebSocket connected");

    socket.send(
      JSON.stringify({
        type: "connection",
        status: "connected",
        message: "TradeXen live market WebSocket connected",
      }),
    );

    // Automatically start Upstox market feed
    if (!marketDataWebSocketService.getStatus().connected) {
      marketDataWebSocketService.connect().catch((error) => {
        console.error(
          "Automatic market data connection failed:",
          error.message,
        );
      });
    }

    socket.on("close", () => {
      console.log("TradeXen frontend WebSocket disconnected");
    });

    socket.on("error", (error) => {
      console.error("TradeXen frontend WebSocket error:", error.message);
    });
  });

  marketDataWebSocketService.addFeedListener((normalizedData) => {
    const message = JSON.stringify({
      type: "market_data",
      data: normalizedData,
    });

    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down server...`);

    wss.close();

    server.close(() => {
      console.log("TradeXen API server stopped.");

      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();
