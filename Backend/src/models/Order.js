import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
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
      enum: ["BUY", "SELL"],
      required: true,
    },

    orderType: {
      type: String,
      enum: ["MARKET", "LIMIT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    requestedPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    executedPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    stopLoss: {
      type: Number,
      min: 0,
      default: null,
    },

    takeProfit: {
      type: Number,
      min: 0,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "OPEN",
        "FILLED",
        "PARTIALLY_FILLED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "PENDING",
      index: true,
    },

    source: {
      type: String,
      enum: ["MANUAL", "BOT"],
      default: "MANUAL",
    },

    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Strategy",
      default: null,
      index: true,
    },

    bot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      default: null,
      index: true,
    },

    executedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({
  user: 1,
  tradingAccount: 1,
  createdAt: -1,
});

orderSchema.index({
  bot: 1,
  createdAt: -1,
});

const Order = mongoose.model("Order", orderSchema);

export default Order;