import mongoose from "mongoose";

const positionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tradingAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradingAccount",
      required: true,
      index: true,
    },

    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    exchange: {
      type: String,
      required: true,
      uppercase: true,
      default: "NSE",
    },

    side: {
      type: String,
      enum: ["LONG", "SHORT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    averageEntryPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    stopLoss: {
      type: Number,
      default: null,
      min: 0,
    },

    takeProfit: {
      type: Number,
      default: null,
      min: 0,
    },

    realizedPnL: {
      type: Number,
      default: 0,
    },

    unrealizedPnL: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
      index: true,
    },

    openedAt: {
      type: Date,
      default: Date.now,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Position = mongoose.model("Position", positionSchema);

export default Position;