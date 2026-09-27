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

    status: {
      type: String,
      enum: ["STOPPED", "STARTING", "RUNNING", "PAUSED", "ERROR"],
      default: "STOPPED",
      index: true,
    },

    mode: {
      type: String,
      enum: ["PAPER"],
      default: "PAPER",
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

    totalSignals: {
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
  }
);

const Bot = mongoose.model("Bot", botSchema);

export default Bot;