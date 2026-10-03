import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    bot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      default: null,
      index: true,
    },

    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Strategy",
      default: null,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "BOT_SIGNAL",
        "ORDER_EXECUTED",
        "RISK_REJECTED",
        "BOT_ERROR",
        "SYSTEM",
      ],
      required: true,
      index: true,
    },

    severity: {
      type: String,
      enum: ["INFO", "SUCCESS", "WARNING", "ERROR"],
      default: "INFO",
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

alertSchema.index({
  user: 1,
  createdAt: -1,
});

alertSchema.index({
  user: 1,
  isRead: 1,
  createdAt: -1,
});

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;