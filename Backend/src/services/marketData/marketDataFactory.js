import marketDataConfig from "../../config/marketData.js";
import UpstoxProvider from "./UpstoxProvider.js";

const createMarketDataProvider = () => {
  switch (marketDataConfig.provider) {
    case "upstox":
      return new UpstoxProvider();

    default:
      throw new Error(
        `Unsupported market data provider: ${marketDataConfig.provider}`,
      );
  }
};

export default createMarketDataProvider;
