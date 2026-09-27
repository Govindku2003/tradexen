import {
  createTradingAccount,
  getTradingAccount,
} from "../services/tradingAccount.service.js";

const createAccount = async (req, res) => {
  try {
    const result = await createTradingAccount(req.userId);

    return res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created
        ? "Trading account created successfully"
        : "Trading account already exists",
      data: {
        account: result.account,
      },
    });
  } catch (error) {
    console.error("Create trading account error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create trading account",
    });
  }
};

const getAccount = async (req, res) => {
  try {
    const tradingAccount = await getTradingAccount(req.userId);

    if (!tradingAccount) {
      return res.status(404).json({
        success: false,
        message: "Trading account not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        account: tradingAccount,
      },
    });
  } catch (error) {
    console.error("Get trading account error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch trading account",
    });
  }
};

export {
  createAccount,
  getAccount,
}; 