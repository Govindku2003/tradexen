import app from "./app.js";
import env from "./config/env.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  await connectDB();

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

  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down server...`);

    server.close(() => {
      console.log("TradeXen API server stopped.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

startServer();