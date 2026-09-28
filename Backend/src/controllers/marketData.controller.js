import { getMarketQuote } from "../services/marketData/marketData.service.js";

const getQuote = async (req, res) => {
  try {
    const instrumentKey =
      req.query.instrumentKey || "NSE_INDEX|Nifty 50";

    const quote = await getMarketQuote(instrumentKey);

    return res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    console.error("Market quote error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch market quote",
    });
  }
};

export { getQuote };