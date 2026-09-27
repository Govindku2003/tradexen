import mongoose from "mongoose";

const dbHealthCheck = (req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const state = mongoose.connection.readyState;

  res.status(state === 1 ? 200 : 503).json({
    success: state === 1,
    database: states[state] || "unknown",
    timestamp: new Date().toISOString(),
  });
};

export { dbHealthCheck };