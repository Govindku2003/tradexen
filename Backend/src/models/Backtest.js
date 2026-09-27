import mongoose from "mongoose";

const backtestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Strategy",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    initialCapital: {
      type: Number,
      required: true,
      min: 0,
    },

    finalCapital: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalReturn: {
      type: Number,
      default: 0,
    },

    totalReturnPercent: {
      type: Number,
      default: 0,
    },

    totalTrades: {
      type: Number,
      default: 0,
      min: 0,
    },

    winningTrades: {
      type: Number,
      default: 0,
      min: 0,
    },

    losingTrades: {
      type: Number,
      default: 0,
      min: 0,
    },

    winRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    maxDrawdown: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },

    errorMessage: {
      type: String,
      default: null,
      maxlength: 500,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Backtest = mongoose.model("Backtest", backtestSchema);

export default Backtest;