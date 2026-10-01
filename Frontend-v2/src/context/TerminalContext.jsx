import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getMarketQuote, getHistoricalCandles, } from "../services/api/marketApi";

const TerminalContext = createContext(null);

/*
  Symbols available in the TradeXen terminal.
*/
export const TERMINAL_SYMBOLS = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    instrumentKey: "NSE_EQ|INE002A01018",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy",
    instrumentKey: "NSE_EQ|INE467B01029",
  },
  {
    symbol: "INFY",
    name: "Infosys",
    instrumentKey: "NSE_EQ|INE009A01021",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    instrumentKey: "NSE_EQ|INE040A01034",
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    instrumentKey: "NSE_EQ|INE090A01021",
  },
];


const TIMEFRAME_CONFIG = {
  "1D": {
    unit: "minutes",
    interval: "5",
    days: 2,
  },
  "1W": {
    unit: "minutes",
    interval: "15",
    days: 7,
  },
  "1M": {
    unit: "minutes",
    interval: "30",
    days: 30,
  },
  "3M": {
    unit: "days",
    interval: "1",
    days: 90,
  },
  "1Y": {
    unit: "days",
    interval: "1",
    days: 365,
  },
};


export function TerminalProvider({ children }) {
  /*
    Currently selected symbol.
  */
  const [selectedSymbol, setSelectedSymbol] =
    useState(TERMINAL_SYMBOLS[0]);

    const [selectedTimeframe, setSelectedTimeframe] =
  useState("1D");

  /*
    Real quote for currently selected symbol.
  */
  const [selectedQuote, setSelectedQuote] =
    useState(null);

  const [quoteLoading, setQuoteLoading] =
    useState(false);

  const [quoteError, setQuoteError] =
    useState("");

  /*
    Real quotes for all Watchlist symbols.

    Structure:

    {
      RELIANCE: {...quote},
      TCS: {...quote},
      INFY: {...quote}
    }
  */
  const [watchlistQuotes, setWatchlistQuotes] =
    useState({});

  const [watchlistLoading, setWatchlistLoading] =
    useState(false);

  const [watchlistError, setWatchlistError] =
    useState("");

    
    const [historicalCandles, setHistoricalCandles] =
  useState([]);

const [historicalLoading, setHistoricalLoading] =
  useState(false);

const [historicalError, setHistoricalError] =
  useState("");

  /*
    Fetch quote for selected symbol.

    Watchlist
       ↓
    selectedSymbol
       ↓
    backend API
       ↓
    selectedQuote
  */
  useEffect(() => {
    let mounted = true;

    const fetchSelectedQuote = async () => {
      if (!selectedSymbol?.instrumentKey) {
        return;
      }

      try {
        setQuoteLoading(true);
        setQuoteError("");

        const data = await getMarketQuote(
          selectedSymbol.instrumentKey,
        );

        if (!mounted) {
          return;
        }

        setSelectedQuote(data);
      } catch (error) {
        console.error(
          "Selected symbol quote error:",
          error,
        );

        if (mounted) {
          setSelectedQuote(null);

          setQuoteError(
            error.message ||
              "Unable to load market data",
          );
        }
      } finally {
        if (mounted) {
          setQuoteLoading(false);
        }
      }
    };

    fetchSelectedQuote();

    return () => {
      mounted = false;
    };
  }, [selectedSymbol]);

  /*
    Fetch real quotes for all Watchlist symbols.

    We use Promise.allSettled so one failed symbol
    does not stop the remaining symbols.
  */
  useEffect(() => {
    let mounted = true;

    const fetchWatchlistQuotes = async () => {
      try {
        setWatchlistLoading(true);
        setWatchlistError("");

        const results = await Promise.allSettled(
          TERMINAL_SYMBOLS.map(async (symbolData) => {
            const quote = await getMarketQuote(
              symbolData.instrumentKey,
            );

            return {
              symbol: symbolData.symbol,
              quote,
            };
          }),
        );

        if (!mounted) {
          return;
        }

        const nextQuotes = {};

        results.forEach((result) => {
          if (result.status === "fulfilled") {
            const { symbol, quote } = result.value;

            nextQuotes[symbol] = quote;
          } else {
            console.error(
              "Watchlist quote error:",
              result.reason,
            );
          }
        });

        setWatchlistQuotes(nextQuotes);

        if (Object.keys(nextQuotes).length === 0) {
          setWatchlistError(
            "Unable to load watchlist market data",
          );
        }
      } catch (error) {
        console.error(
          "Watchlist quotes error:",
          error,
        );

        if (mounted) {
          setWatchlistError(
            error.message ||
              "Unable to load watchlist data",
          );
        }
      } finally {
        if (mounted) {
          setWatchlistLoading(false);
        }
      }
    };

    fetchWatchlistQuotes();

    return () => {
      mounted = false;
    };
  }, []);


  useEffect(() => {
  let mounted = true;

  const fetchHistoricalCandles = async () => {
    if (!selectedSymbol?.instrumentKey) {
      return;
    }

    const config =
      TIMEFRAME_CONFIG[selectedTimeframe];

    if (!config) {
      return;
    }

    try {
      setHistoricalLoading(true);
      setHistoricalError("");

      const today = new Date();

      const toDate =
        today.toISOString().split("T")[0];

      const fromDate = new Date(today);

      fromDate.setDate(
        fromDate.getDate() - config.days,
      );

      const from =
        fromDate.toISOString().split("T")[0];

      const response =
        await getHistoricalCandles({
          instrumentKey:
            selectedSymbol.instrumentKey,

          unit: config.unit,

          interval: config.interval,

          from,

          to: toDate,
        });

      if (!mounted) {
        return;
      }

      const candles = Array.isArray(response)
  ? response
  : [];

setHistoricalCandles(candles);
    } catch (error) {
      console.error(
        "Historical candles error:",
        error,
      );

      if (mounted) {
        setHistoricalCandles([]);

        setHistoricalError(
          error.message ||
            "Unable to load historical market data",
        );
      }
    } finally {
      if (mounted) {
        setHistoricalLoading(false);
      }
    }
  };

  fetchHistoricalCandles();

  return () => {
    mounted = false;
  };
}, [selectedSymbol, selectedTimeframe]);
  /*
    Select a symbol from Watchlist.
  */
  const selectSymbol = (symbolData) => {
    setSelectedSymbol(symbolData);
  };

  return (
    <TerminalContext.Provider
      value={{
        selectedSymbol,
        selectedQuote,

        quoteLoading,
        quoteError,

        watchlistQuotes,
        watchlistLoading,
        watchlistError,

        historicalCandles,
        historicalLoading,
        historicalError,
        selectedTimeframe,
          setSelectedTimeframe,

        selectSymbol,

        symbols: TERMINAL_SYMBOLS,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);

  if (!context) {
    throw new Error(
      "useTerminal must be used inside TerminalProvider",
    );
  }

  return context;
}