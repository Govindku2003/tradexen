import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    tradingAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradingAccount",
      required: true,
    },

    totalValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    cashBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    investedValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPnL: {
      type: Number,
      default: 0,
    },

    todayPnL: {
      type: Number,
      default: 0,
    },

    totalPnLPercent: {
      type: Number,
      default: 0,
    },

    todayPnLPercent: {
      type: Number,
      default: 0,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;