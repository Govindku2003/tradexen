import TradingAccount from "../../models/TradingAccount.js";
import { calculateInvestedAmount } from "../positions/position.service.js";

const syncInvestedAmount = async ({ userId, tradingAccountId }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!tradingAccountId) {
    throw new Error("Trading account ID is required");
  }

  const tradingAccount = await TradingAccount.findOne({
    _id: tradingAccountId,
    user: userId,
    status: "active",
  });

  if (!tradingAccount) {
    throw new Error("Active trading account not found");
  }

  const investedAmount = await calculateInvestedAmount({
    userId,
    tradingAccountId,
  });

  tradingAccount.investedAmount = investedAmount;

  await tradingAccount.save();

  return tradingAccount;
};

export { syncInvestedAmount };
