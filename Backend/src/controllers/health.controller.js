const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    service: "TradeXen API",
    status: "healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};

export { healthCheck };