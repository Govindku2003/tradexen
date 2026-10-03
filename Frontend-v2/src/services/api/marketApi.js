import apiRequest from "./apiClient";

/*
  Fetch current market quote.

  Backend:
  GET /api/market-data/quote?instrumentKey=...
*/
const getMarketQuote = async (instrumentKey) => {
  if (!instrumentKey) {
    throw new Error("Instrument key is required");
  }

  const encodedInstrumentKey = encodeURIComponent(instrumentKey);

  const response = await apiRequest(
    `/market-data/quote?instrumentKey=${encodedInstrumentKey}`,
  );

  return response.data;
};

/*
  Fetch historical market candles.

  Backend:
  GET /api/market-data/historical

  Parameters:
  - instrumentKey
  - unit
  - interval
  - from
  - to
*/
const getHistoricalCandles = async ({
  instrumentKey,
  unit = "minutes",
  interval = "5",
  from,
  to,
}) => {
  if (!instrumentKey) {
    throw new Error("Instrument key is required");
  }

  if (!to) {
    throw new Error("To date is required");
  }

  const params = new URLSearchParams();

  params.set("instrumentKey", instrumentKey);
  params.set("unit", unit);
  params.set("interval", interval);

  if (from) {
    params.set("from", from);
  }

  params.set("to", to);

  const response = await apiRequest(
    `/market-data/historical?${params.toString()}`,
  );

  return response.data;
};

export { getMarketQuote, getHistoricalCandles };
