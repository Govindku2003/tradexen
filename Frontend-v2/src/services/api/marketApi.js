import apiRequest from "./apiClient";

/*
  Fetch market quote from TradeXen backend.

  Backend endpoint:
  GET /api/market-data/quote?instrumentKey=...

  Backend normalized response:
  {
    instrumentKey,
    symbol,
    price,
    change,
    ohlc,
    volume,
    timestamp
  }
*/
const getMarketQuote = async (instrumentKey) => {
  if (!instrumentKey) {
    throw new Error("Instrument key is required");
  }

  const encodedInstrumentKey = encodeURIComponent(instrumentKey);

  const response = await apiRequest(
    `/market-data/quote?instrumentKey=${encodedInstrumentKey}`,
  );

  /*
    Backend controller returns:

    {
      success: true,
      data: quote
    }

    So frontend only returns `data`.
  */
  return response.data;
};

export { getMarketQuote };