import mongoose from "mongoose";

const marketDataSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    exchange: {
      type: String,
      required: true,
      uppercase: true,
      default: "NSE",
      index: true,
    },

    instrumentKey: {
      type: String,
      default: null,
      index: true,
    },

    lastPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    open: {
      type: Number,
      default: null,
      min: 0,
    },

    high: {
      type: Number,
      default: null,
      min: 0,
    },

    low: {
      type: Number,
      default: null,
      min: 0,
    },

    previousClose: {
      type: Number,
      default: null,
      min: 0,
    },

    volume: {
      type: Number,
      default: 0,
      min: 0,
    },

    change: {
      type: Number,
      default: 0,
    },

    changePercent: {
      type: Number,
      default: 0,
    },

    timestamp: {
      type: Date,
      required: true,
      index: true,
    },

    source: {
      type: String,
      required: true,
      default: "MARKET_API",
    },
  },
  {
    timestamps: true,
  }
);

marketDataSchema.index({
  symbol: 1,
  exchange: 1,
  timestamp: -1,
});

const MarketData = mongoose.model("MarketData", marketDataSchema);

export default MarketData;