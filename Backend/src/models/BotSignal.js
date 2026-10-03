import mongoose from "mongoose";

const botSignalSchema = new mongoose.Schema(
  {
    bot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
      index: true,
    },

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

    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },

    instrumentKey: {
      type: String,
      required: true,
    },

    signal: {
      type: String,
      enum: ["BUY", "SELL", "HOLD"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      default: "",
    },

    indicators: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    executed: {
      type: Boolean,
      default: false,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    executionMessage: {
      type: String,
      default: null,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

botSignalSchema.index({
  bot: 1,
  generatedAt: -1,
});

const BotSignal = mongoose.model(
  "BotSignal",
  botSignalSchema,
);

export default BotSignal;