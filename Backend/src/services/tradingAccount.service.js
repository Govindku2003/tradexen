import TradingAccount from "../models/TradingAccount.js";

const createTradingAccount = async (userId) => {
  const existingAccount = await TradingAccount.findOne({
    user: userId,
  });

  if (existingAccount) {
    return {
      account: existingAccount,
      created: false,
    };
  }

  const tradingAccount = await TradingAccount.create({
    user: userId,
    accountType: "paper",
    initialBalance: 1000000,
    availableBalance: 1000000,
    investedAmount: 0,
    currency: "INR",
    status: "active",
  });

  return {
    account: tradingAccount,
    created: true,
  };
};

const getTradingAccount = async (userId) => {
  const tradingAccount = await TradingAccount.findOne({
    user: userId,
  });

  return tradingAccount;
};

export {
  createTradingAccount,
  getTradingAccount,
};