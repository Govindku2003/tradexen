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
      default: null,
      index: true,
    },

    strategyKey: {
      type: String,
      default: "all",
      trim: true,
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

    instrumentKey: {
      type: String,
      required: true,
      trim: true,
    },

    exchange: {
      type: String,
      required: true,
      uppercase: true,
      default: "NSE",
    },

    unit: {
      type: String,
      required: true,
      default: "days",
    },

    interval: {
      type: String,
      required: true,
      default: "1",
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
      min: 0,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    trades: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    equityCurve: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    candlesProcessed: {
      type: Number,
      default: 0,
      min: 0,
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
  },
);

backtestSchema.index({
  user: 1,
  createdAt: -1,
});

backtestSchema.index({
  user: 1,
  strategy: 1,
  createdAt: -1,
});

const Backtest = mongoose.model("Backtest", backtestSchema);

export default Backtest;