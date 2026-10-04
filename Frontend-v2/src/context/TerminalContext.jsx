import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getMarketQuote,
  getHistoricalCandles,
} from "../services/api/marketApi";

import {
  getMarketIndicators,
} from "../services/api/indicatorApi";

import {
  subscribeMarketWebSocket,
} from "../services/websocket/marketWebSocket";

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

/*
  Return YYYY-MM-DD using local date values.

  We intentionally avoid toISOString() here because
  ISO conversion uses UTC and can shift the calendar
  date depending on timezone.
*/
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/*
  Move a date to the latest weekday.

  Saturday -> Friday
  Sunday   -> Friday

  This prevents the historical market-data API
  from being queried for a weekend date.
*/
const getLatestTradingDate = (date) => {
  const result = new Date(date);

  const day = result.getDay();

  if (day === 0) {
    result.setDate(result.getDate() - 2);
  } else if (day === 6) {
    result.setDate(result.getDate() - 1);
  }

  return result;
};

/*
  Build a historical date range based on the selected
  timeframe.

  Example:

  Sunday 2026-10-04
       ↓
  latest trading date
       ↓
  Friday 2026-10-02
*/
const getHistoricalDateRange = (days) => {
  const today = new Date();

  const toDateObject = getLatestTradingDate(today);

  const fromDateObject = new Date(toDateObject);

  fromDateObject.setDate(
    fromDateObject.getDate() - days,
  );

  return {
    from: formatDate(fromDateObject),
    to: formatDate(toDateObject),
  };
};

export function TerminalProvider({ children }) {
  /*
    Currently selected symbol.
  */
  const [selectedSymbol, setSelectedSymbol] =
    useState(TERMINAL_SYMBOLS[0]);

  /*
    Keep selected symbol available to the
    WebSocket listener without reconnecting
    the WebSocket whenever selection changes.
  */
  const selectedSymbolRef = useRef(
    TERMINAL_SYMBOLS[0],
  );

  /*
    Live quotes received through WebSocket.

    This is the single source of truth for
    current market prices after WebSocket
    becomes available.
  */
  const liveQuotesRef = useRef({});

  /*
    Selected chart timeframe.
  */
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
  */
  const [watchlistQuotes, setWatchlistQuotes] =
    useState({});

  const [watchlistLoading, setWatchlistLoading] =
    useState(false);

  const [watchlistError, setWatchlistError] =
    useState("");

  /*
    Historical candles for chart.
  */
  const [historicalCandles, setHistoricalCandles] =
    useState([]);

  const [historicalLoading, setHistoricalLoading] =
    useState(false);

  const [historicalError, setHistoricalError] =
    useState("");

  /*
    Frontend WebSocket connection status.
  */
  const [marketConnectionStatus, setMarketConnectionStatus] =
    useState("disconnected");

  /*
    Keep ref synchronized with selected symbol.
  */
  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol;
  }, [selectedSymbol]);

  /*
    Fetch quote for selected symbol.

    REST is used only for the initial/fallback
    quote.

    If WebSocket has already supplied a live
    quote, REST is NOT allowed to overwrite it.
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

        /*
          Do not overwrite an already available
          WebSocket price.
        */
        if (
          !liveQuotesRef.current[
            selectedSymbol.symbol
          ]
        ) {
          setSelectedQuote(data);
        }
      } catch (error) {
        console.error(
          "Selected symbol quote error:",
          error,
        );

        if (mounted) {
          /*
            Only clear the quote when there is
            no live WebSocket quote available.
          */
          if (
            !liveQuotesRef.current[
              selectedSymbol.symbol
            ]
          ) {
            setSelectedQuote(null);
          }

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

    REST provides initial values.

    WebSocket becomes the source of truth
    for live/current values.
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
            const {
              symbol,
              quote,
            } = result.value;

            nextQuotes[symbol] = quote;
          } else {
            console.error(
              "Watchlist quote error:",
              result.reason,
            );
          }
        });

        /*
          Merge REST values with existing live
          WebSocket values.

          Live WebSocket values always win.
        */
        setWatchlistQuotes(
          (previousQuotes) => {
            const mergedQuotes = {
              ...nextQuotes,
              ...previousQuotes,
            };

            Object.entries(
              liveQuotesRef.current,
            ).forEach(
              ([symbol, liveQuote]) => {
                mergedQuotes[symbol] =
                  liveQuote;
              },
            );

            return mergedQuotes;
          },
        );

        if (
          Object.keys(nextQuotes).length === 0 &&
          Object.keys(liveQuotesRef.current)
            .length === 0
        ) {
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

  /*
    Fetch historical candles for selected
    symbol/timeframe.
  */
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

        /*
          IMPORTANT:

          Do not use today's calendar date directly.

          On Saturday/Sunday the market is closed,
          so the historical API may return 404.

          Example:
          Sunday 2026-10-04
              ↓
          Friday 2026-10-02
        */
        const {
          from,
          to,
        } = getHistoricalDateRange(
          config.days,
        );

        console.log(
          "Historical market data range:",
          {
            symbol: selectedSymbol.symbol,
            timeframe: selectedTimeframe,
            from,
            to,
          },
        );

        const response =
          await getMarketIndicators({
            instrumentKey:
              selectedSymbol.instrumentKey,

            unit: config.unit,

            interval: config.interval,

            from,

            to,

            smaPeriod: 20,
            emaPeriod: 20,
            rsiPeriod: 14,
            macdFastPeriod: 12,
            macdSlowPeriod: 26,
            macdSignalPeriod: 9,
          });

        if (!mounted) {
          return;
        }

        const candles =
  Array.isArray(response?.data?.candles)
    ? response.data.candles
    : [];

        if (candles.length === 0) {
          throw new Error(
            "No historical candles found",
          );
        }

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
    Connect to TradeXen frontend WebSocket.

    WebSocket is created once when
    TerminalProvider mounts.

    It is not recreated when the selected
    symbol changes.
  */
  useEffect(() => {
    const unsubscribe =
      subscribeMarketWebSocket(
        (message) => {
          /*
            Connection status.
          */
          if (message?.type === "connection") {
            setMarketConnectionStatus(
              message.status ||
                "disconnected",
            );

            return;
          }

          /*
            Ignore messages that are not
            market-data messages.
          */
          if (
            message?.type !== "market_data"
          ) {
            return;
          }

          const feeds =
            message?.data?.feeds;

          if (!Array.isArray(feeds)) {
            return;
          }

          /*
            Update Watchlist quotes.
          */
          setWatchlistQuotes(
            (previousQuotes) => {
              const nextQuotes = {
                ...previousQuotes,
              };

              feeds.forEach((feed) => {
                const symbolData =
                  TERMINAL_SYMBOLS.find(
                    (item) =>
                      item.instrumentKey ===
                      feed.instrumentKey,
                  );

                if (!symbolData) {
                  return;
                }

                const price =
                  feed.price ?? null;

                const previousClose =
                  feed.previousClose ?? null;

                const change =
                  price !== null &&
                  previousClose !== null
                    ? price - previousClose
                    : null;

                /*
                  Create one normalized live
                  quote object.

                  This exact object is used by
                  Watchlist and selected quote.
                */
                const liveQuote = {
                  instrumentKey:
                    feed.instrumentKey,

                  symbol:
                    symbolData.symbol,

                  price,

                  change,

                  previousClose,

                  timestamp:
                    feed.lastTradedTime ||
                    message.data
                      .currentTimestamp,
                };

                /*
                  Keep latest WebSocket value
                  in the ref so REST cannot
                  overwrite it later.
                */
                liveQuotesRef.current[
                  symbolData.symbol
                ] = liveQuote;

                nextQuotes[
                  symbolData.symbol
                ] = liveQuote;
              });

              return nextQuotes;
            },
          );

          /*
            Update selected symbol quote.
          */
          const currentSelectedSymbol =
            selectedSymbolRef.current;

          if (
            !currentSelectedSymbol
              ?.instrumentKey
          ) {
            return;
          }

          const liveFeed =
            feeds.find(
              (feed) =>
                feed.instrumentKey ===
                currentSelectedSymbol.instrumentKey,
            );

          if (!liveFeed) {
            return;
          }

          const price =
            liveFeed.price ?? null;

          const previousClose =
            liveFeed.previousClose ?? null;

          const change =
            price !== null &&
            previousClose !== null
              ? price - previousClose
              : null;

          const liveSelectedQuote = {
            instrumentKey:
              liveFeed.instrumentKey,

            symbol:
              currentSelectedSymbol.symbol,

            price,

            change,

            previousClose,

            timestamp:
              liveFeed.lastTradedTime ||
              message.data
                .currentTimestamp,
          };

          /*
            Store selected symbol's latest
            WebSocket value.
          */
          liveQuotesRef.current[
            currentSelectedSymbol.symbol
          ] = liveSelectedQuote;

          /*
            WebSocket is the final source
            of truth for current price.
          */
          setSelectedQuote(
            liveSelectedQuote,
          );
        },
      );

    return unsubscribe;
  }, []);

  /*
    Select a symbol from Watchlist.
  */
  const selectSymbol = (symbolData) => {
    setSelectedSymbol(symbolData);

    /*
      If we already have a live quote for
      the selected symbol, immediately use it.
    */
    const liveQuote =
      liveQuotesRef.current[
        symbolData.symbol
      ];

    if (liveQuote) {
      setSelectedQuote(liveQuote);
    }
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

        marketConnectionStatus,

        selectSymbol,

        symbols: TERMINAL_SYMBOLS,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context =
    useContext(TerminalContext);

  if (!context) {
    throw new Error(
      "useTerminal must be used inside TerminalProvider",
    );
  }

  return context;
}