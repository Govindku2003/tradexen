import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useTerminal } from "../../context/TerminalContext";
import { getMarketQuote } from "../../services/api/marketApi";

const NIFTY_INSTRUMENT_KEY = "NSE_INDEX|Nifty 50";

const TICKER_SYMBOLS = [
  {
    symbol: "NIFTY 50",
    instrumentKey: NIFTY_INSTRUMENT_KEY,
    type: "index",
  },
  {
    symbol: "RELIANCE",
    instrumentKey: "NSE_EQ|INE002A01018",
    type: "stock",
  },
  {
    symbol: "TCS",
    instrumentKey: "NSE_EQ|INE467B01029",
    type: "stock",
  },
  {
    symbol: "INFY",
    instrumentKey: "NSE_EQ|INE009A01021",
    type: "stock",
  },
  {
    symbol: "HDFCBANK",
    instrumentKey: "NSE_EQ|INE040A01034",
    type: "stock",
  },
  {
    symbol: "ICICIBANK",
    instrumentKey: "NSE_EQ|INE090A01021",
    type: "stock",
  },
];

const formatPrice = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "--";
  }

  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const calculateChangePercent = (
  price,
  change,
  previousClose
) => {
  const currentPrice = Number(price);
  const absoluteChange = Number(change);

  if (
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(absoluteChange)
  ) {
    return null;
  }

  /*
   * First preference:
   * use actual previous close.
   */
  let previous = Number(previousClose);

  /*
   * Fallback:
   *
   * previousClose = currentPrice - change
   *
   * Example:
   * 1167.70 - (-19.30) = 1187.00
   */
  if (!Number.isFinite(previous) || previous === 0) {
    previous = currentPrice - absoluteChange;
  }

  if (!Number.isFinite(previous) || previous === 0) {
    return null;
  }

  return (absoluteChange / previous) * 100;
};

const normalizeNiftyQuote = (data) => {
  if (!data) {
    return null;
  }

  const price =
    data.price !== null &&
    data.price !== undefined
      ? Number(data.price)
      : null;

  const change =
    data.change !== null &&
    data.change !== undefined
      ? Number(data.change)
      : null;

  let previousClose =
    data.previousClose !== null &&
    data.previousClose !== undefined
      ? Number(data.previousClose)
      : null;

  /*
   * API fallback.
   */
  if (
    (!Number.isFinite(previousClose) ||
      previousClose === 0) &&
    Number.isFinite(price) &&
    Number.isFinite(change)
  ) {
    previousClose = price - change;
  }

  const changePercent = calculateChangePercent(
    price,
    change,
    previousClose
  );

  return {
    price,
    change,
    previousClose,
    changePercent,
    source: "api",
  };
};

function MarketTicker() {
  const { theme } = useTheme();

  const {
    watchlistQuotes,
    marketConnectionStatus,
  } = useTerminal();

  const isDark = theme === "dark";

  const [niftyQuote, setNiftyQuote] = useState(null);
  const [niftyLoading, setNiftyLoading] = useState(true);
  const [niftyError, setNiftyError] = useState("");

  /*
   * NIFTY is currently API based.
   * The five stocks come from WebSocket.
   */
  useEffect(() => {
    let mounted = true;

    const fetchNifty = async () => {
      try {
        setNiftyLoading(true);
        setNiftyError("");

        const data = await getMarketQuote(
          NIFTY_INSTRUMENT_KEY
        );

        if (!mounted) {
          return;
        }

        setNiftyQuote(
          normalizeNiftyQuote(data)
        );
      } catch (error) {
        console.error(
          "NIFTY ticker error:",
          error
        );

        if (mounted) {
          setNiftyError(
            error.message ||
              "Unable to load NIFTY"
          );
        }
      } finally {
        if (mounted) {
          setNiftyLoading(false);
        }
      }
    };

    fetchNifty();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Build ticker from TerminalContext.
   *
   * Watchlist and MarketTicker therefore use
   * exactly the same live market data.
   */
  const tickerData = TICKER_SYMBOLS.map(
    (item) => {
      /*
       * NIFTY
       */
      if (item.type === "index") {
        return {
          ...item,
          quote: niftyQuote,
          isLive: false,
          source: "api",
        };
      }

      /*
       * Stocks
       */
      const quote =
        watchlistQuotes?.[item.symbol];

      if (!quote) {
        return {
          ...item,
          quote: null,
          isLive: false,
          source: "api",
        };
      }

      const price =
        quote.price !== null &&
        quote.price !== undefined
          ? Number(quote.price)
          : null;

      const change =
        quote.change !== null &&
        quote.change !== undefined
          ? Number(quote.change)
          : null;

      let previousClose =
        quote.previousClose !== null &&
        quote.previousClose !== undefined
          ? Number(quote.previousClose)
          : null;

      /*
       * IMPORTANT:
       *
       * If backend/context does not provide
       * previousClose, calculate it from:
       *
       * previousClose = price - change
       */
      if (
        (!Number.isFinite(previousClose) ||
          previousClose === 0) &&
        Number.isFinite(price) &&
        Number.isFinite(change)
      ) {
        previousClose = price - change;
      }

      const changePercent =
        calculateChangePercent(
          price,
          change,
          previousClose
        );

      return {
        ...item,

        quote: {
          price,
          change,
          previousClose,
          changePercent,
        },

        /*
         * If quote exists in TerminalContext,
         * it is coming from the live terminal feed.
         */
        isLive: true,
        source: "websocket",
      };
    }
  );

  /*
   * Count live stock feeds.
   */
  const liveStockCount =
    tickerData.filter(
      (item) =>
        item.type === "stock" &&
        item.isLive
    ).length;

  /*
   * Do NOT depend only on marketConnectionStatus
   * for the ticker badge.
   *
   * The actual quote data already proves that
   * live stock data is present.
   */
  const isLiveMarket =
    liveStockCount > 0;

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* HEADER */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          isDark
            ? "border-b border-slate-800"
            : "border-b border-slate-200"
        }`}
      >
        <div
          className={`text-xs font-medium uppercase tracking-wide ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          Market Ticker
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isLiveMarket ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="font-medium text-emerald-400">
                Live WebSocket
              </span>
            </>
          ) : niftyLoading ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />

              <span className="font-medium text-yellow-400">
                Loading
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-orange-400" />

              <span className="font-medium text-orange-400">
                API Data
              </span>
            </>
          )}
        </div>
      </div>

      {/* TICKER */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {tickerData.map(
          (item, index) => {
            const quote = item.quote;

            const price =
              quote?.price ?? null;

            const change =
              quote?.change ?? null;

            const changePercent =
              quote?.changePercent ?? null;

            const isPositive =
              changePercent !== null &&
              changePercent >= 0;

            const isNegative =
              changePercent !== null &&
              changePercent < 0;

            return (
              <div
                key={item.instrumentKey}
                className={`min-w-0 px-5 py-3 ${
                  index !==
                  tickerData.length - 1
                    ? isDark
                      ? "border-r border-slate-800"
                      : "border-r border-slate-200"
                    : ""
                }`}
              >
                {/* Symbol */}
                <div
                  className={`mb-1 truncate text-sm font-medium ${
                    isDark
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  {item.symbol}
                </div>

                {/* Price + Percentage */}
                <div className="flex items-baseline gap-2 whitespace-nowrap">
                  <span
                    className={`text-sm font-semibold ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    {formatPrice(price)}
                  </span>

                  {changePercent !== null ? (
                    <span
                      className={`text-xs font-medium ${
                        isPositive
                          ? "text-emerald-400"
                          : isNegative
                          ? "text-red-400"
                          : "text-slate-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {changePercent.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      --
                    </span>
                  )}
                </div>

                {/* Absolute Change */}
                {change !== null &&
                  Number.isFinite(
                    Number(change)
                  ) && (
                    <div
                      className={`mt-0.5 text-[10px] ${
                        isPositive
                          ? "text-emerald-500/80"
                          : isNegative
                          ? "text-red-500/80"
                          : "text-slate-500"
                      }`}
                    >
                      {Number(change) > 0
                        ? "+"
                        : ""}
                      {Number(change).toFixed(2)}
                    </div>
                  )}

                {/* Source */}
                <div className="mt-1 flex items-center gap-1">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      item.isLive
                        ? "bg-emerald-400"
                        : "bg-orange-400"
                    }`}
                  />

                  <span
                    className={`text-[9px] ${
                      item.isLive
                        ? "text-emerald-500"
                        : "text-orange-400"
                    }`}
                  >
                    {item.isLive
                      ? "LIVE"
                      : "API"}
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* NIFTY ERROR */}
      {niftyError && (
        <div className="border-t border-red-500/20 px-4 py-2 text-xs text-red-400">
          {niftyError}
        </div>
      )}
    </section>
  );
}

export default MarketTicker;