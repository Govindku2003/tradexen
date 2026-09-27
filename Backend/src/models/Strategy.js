import mongoose from "mongoose";

const strategySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
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

    strategyType: {
      type: String,
      enum: ["EMA_CROSSOVER", "RSI", "MACD"],
      required: true,
    },

    parameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    riskSettings: {
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
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Strategy = mongoose.model("Strategy", strategySchema);

export default Strategy;