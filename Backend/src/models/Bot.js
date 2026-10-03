import mongoose from "mongoose";

const botSchema = new mongoose.Schema(
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
      index: true,
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

    /*
      SIGNAL
      = Bot analyzes and gives signal.
      Human decides whether to trade.

      AUTO
      = Bot analyzes, validates risk and
        creates/execut es paper orders automatically.
    */
    controlMode: {
      type: String,
      enum: ["SIGNAL", "AUTO"],
      default: "SIGNAL",
    },

    status: {
      type: String,
      enum: [
        "STOPPED",
        "STARTING",
        "RUNNING",
        "PAUSED",
        "ERROR",
      ],
      default: "STOPPED",
      index: true,
    },

    mode: {
      type: String,
      enum: ["PAPER"],
      default: "PAPER",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    timeframe: {
      type: String,
      enum: ["1", "5", "15", "30", "60"],
      default: "5",
    },

    settings: {
      stopLossPercent: {
        type: Number,
        default: 1,
        min: 0,
      },

      takeProfitPercent: {
        type: Number,
        default: 2,
        min: 0,
      },

      maxPositionSize: {
        type: Number,
        default: 50000,
        min: 0,
      },

      dailyLossLimit: {
        type: Number,
        default: 5000,
        min: 0,
      },

      allowBuy: {
        type: Boolean,
        default: true,
      },

      allowSell: {
        type: Boolean,
        default: true,
      },

      autoExecute: {
        type: Boolean,
        default: false,
      },
    },

    startedAt: {
      type: Date,
      default: null,
    },

    stoppedAt: {
      type: Date,
      default: null,
    },

    lastSignal: {
      type: String,
      enum: ["BUY", "SELL", "HOLD", null],
      default: null,
    },

    lastSignalAt: {
      type: Date,
      default: null,
    },

    lastProcessedSignal: {
      type: String,
      enum: ["BUY", "SELL", "HOLD", null],
      default: null,
    },

    lastPrice: {
      type: Number,
      default: null,
    },

    lastAnalysisAt: {
      type: Date,
      default: null,
    },

    totalSignals: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTrades: {
      type: Number,
      default: 0,
      min: 0,
    },

    errorMessage: {
      type: String,
      default: null,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

botSchema.index({
  user: 1,
  status: 1,
});

const Bot = mongoose.model("Bot", botSchema);

export default Bot;