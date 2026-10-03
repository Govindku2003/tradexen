import { calculatePortfolio } from "../services/portfolio/portfolio.service.js";

const getPortfolioController = async (req, res) => {
  try {
    const result = await calculatePortfolio({
      userId: req.userId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export { getPortfolioController };