const normalizeMarketQuote = (rawResponse, instrumentKey) => {
  if (!rawResponse) {
    throw new Error("Market quote response is empty");
  }

  const responseKey = Object.keys(rawResponse?.data || {})[0];

  const marketData = responseKey ? rawResponse.data[responseKey] : null;

  if (!marketData) {
    throw new Error(
      `Market data not found for instrument: ${instrumentKey}`,
    );
  }

  const normalizedData = {
    instrumentKey,
    symbol: marketData.symbol || instrumentKey,
    price: marketData.last_price ?? null,
    change: marketData.net_change ?? null,

    ohlc: {
      open: marketData.ohlc?.open ?? null,
      high: marketData.ohlc?.high ?? null,
      low: marketData.ohlc?.low ?? null,
      close: marketData.ohlc?.close ?? null,
    },

    volume: marketData.volume ?? marketData.ohlc?.volume ?? null,

    timestamp:
      marketData.timestamp || new Date().toISOString(),
  };

  return normalizedData;
};


const normalizeHistoricalCandles = (
  rawResponse,
  instrumentKey,
) => {
  if (!rawResponse) {
    throw new Error("Historical market data response is empty");
  }

  const candles = rawResponse?.data?.candles;

  if (!Array.isArray(candles)) {
    throw new Error(
      `Historical candles not found for instrument: ${instrumentKey}`,
    );
  }

  return candles.map((candle) => {
    if (!Array.isArray(candle) || candle.length < 6) {
      throw new Error(
        `Invalid historical candle received for instrument: ${instrumentKey}`,
      );
    }

    const [
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    ] = candle;

    return {
      instrumentKey,
      timestamp,
      open: open ?? null,
      high: high ?? null,
      low: low ?? null,
      close: close ?? null,
      volume: volume ?? null,
    };
  });
};


export {
  normalizeMarketQuote,
  normalizeHistoricalCandles,
};