import mongoose from "mongoose";

const tradingAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountType: {
      type: String,
      enum: ["paper"],
      default: "paper",
    },

    initialBalance: {
      type: Number,
      required: true,
      default: 1000000,
      min: 0,
    },

    availableBalance: {
      type: Number,
      required: true,
      default: 1000000,
      min: 0,
    },

    investedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const TradingAccount = mongoose.model(
  "TradingAccount",
  tradingAccountSchema
);

export default TradingAccount;