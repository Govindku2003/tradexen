import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  BarChart3,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  Volume2,
  Wifi,
  WifiOff,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { subscribeMarketWebSocket } from "../services/websocket/marketWebSocket";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const MARKET_SYMBOLS = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    instrumentKey: "NSE_EQ|INE002A01018",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
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

const formatPrice = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "--";
  }

  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatVolume = (value) => {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "--";
  }

  const volume = Number(value);

  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(2)} Cr`;
  }

  if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)} L`;
  }

  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)} K`;
  }

  return volume.toLocaleString("en-IN");
};

const getChangePercent = (price, change) => {
  const currentPrice = Number(price);
  const currentChange = Number(change);

  if (
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(currentChange)
  ) {
    return null;
  }

  const previousClose = currentPrice - currentChange;

  if (!previousClose) {
    return null;
  }

  return (currentChange / previousClose) * 100;
};

const getMarketStatus = (changePercent) => {
  if (changePercent === null) {
    return {
      label: "Waiting",
      icon: Activity,
    };
  }

  if (changePercent >= 1) {
    return {
      label: "Strong",
      icon: TrendingUp,
    };
  }

  if (changePercent > 0) {
    return {
      label: "Positive",
      icon: TrendingUp,
    };
  }

  if (changePercent <= -1) {
    return {
      label: "Weak",
      icon: TrendingDown,
    };
  }

  if (changePercent < 0) {
    return {
      label: "Negative",
      icon: TrendingDown,
    };
  }

  return {
    label: "Neutral",
    icon: Activity,
  };
};

function Markets() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState("connecting");

  const isDark = theme === "dark";

  const fetchQuotes = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const results = await Promise.all(
        MARKET_SYMBOLS.map(async (item) => {
          const response = await fetch(
            `${API_BASE_URL}/market-data/quote?instrumentKey=${encodeURIComponent(
              item.instrumentKey
            )}`
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch ${item.symbol}`);
          }

          const result = await response.json();

          return {
            ...item,
            quote: result?.data || null,
          };
        })
      );

      const nextQuotes = {};

      results.forEach((item) => {
        nextQuotes[item.symbol] = item;
      });

      setQuotes(nextQuotes);
    } catch (requestError) {
      console.error("Markets quote error:", requestError);

      setError(
        requestError.message || "Unable to load market data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotes();

    const unsubscribe = subscribeMarketWebSocket((message) => {
      if (message?.type === "connection") {
        setConnectionStatus(
          message.status || "disconnected"
        );
        return;
      }

      if (message?.type !== "market_data") {
        return;
      }

      setConnectionStatus("connected");

      const feeds = message?.data?.feeds;

      if (!Array.isArray(feeds)) {
        return;
      }

      setQuotes((currentQuotes) => {
        const updatedQuotes = {
          ...currentQuotes,
        };

        feeds.forEach((feed) => {
          const existingSymbol = MARKET_SYMBOLS.find(
            (item) =>
              item.instrumentKey === feed.instrumentKey
          );

          if (!existingSymbol) {
            return;
          }

          const existing =
            updatedQuotes[existingSymbol.symbol];

          updatedQuotes[existingSymbol.symbol] = {
            ...existing,
            ...existingSymbol,
            quote: {
              ...(existing?.quote || {}),
              price: feed.price,

              change:
                feed.price !== null &&
                feed.previousClose !== null
                  ? Number(feed.price) -
                    Number(feed.previousClose)
                  : existing?.quote?.change ?? null,

              timestamp:
                feed.lastTradedTime ||
                message?.data?.currentTimestamp ||
                existing?.quote?.timestamp ||
                null,
            },
          };
        });

        return updatedQuotes;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const marketRows = useMemo(() => {
    const rows = MARKET_SYMBOLS.map((item) => {
      return (
        quotes[item.symbol] || {
          ...item,
          quote: null,
        }
      );
    });

    const query = search.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter(
      (item) =>
        item.symbol.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    );
  }, [quotes, search]);

  const rankedRows = useMemo(() => {
    return [...marketRows].sort((a, b) => {
      const aPercent =
        getChangePercent(
          a.quote?.price,
          a.quote?.change
        ) ?? -Infinity;

      const bPercent =
        getChangePercent(
          b.quote?.price,
          b.quote?.change
        ) ?? -Infinity;

      return bPercent - aPercent;
    });
  }, [marketRows]);

  const strongest = rankedRows[0];

  const weakest =
    rankedRows.length > 0
      ? rankedRows[rankedRows.length - 1]
      : null;

  const averageChange = useMemo(() => {
    const validChanges = MARKET_SYMBOLS.map((item) => {
      const row = quotes[item.symbol];

      return getChangePercent(
        row?.quote?.price,
        row?.quote?.change
      );
    }).filter((value) => value !== null);

    if (!validChanges.length) {
      return null;
    }

    return (
      validChanges.reduce(
        (total, value) => total + value,
        0
      ) / validChanges.length
    );
  }, [quotes]);

  return (
    <div
      className={`min-h-full p-4 md:p-6 ${
        isDark
          ? "bg-[#080b12] text-white"
          : "bg-slate-50 text-slate-950"
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Markets
            </h1>

            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                connectionStatus === "connected"
                  ? isDark
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : isDark
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-amber-300 bg-amber-50 text-amber-800"
              }`}
            >
              {connectionStatus === "connected" ? (
                <Wifi size={13} />
              ) : (
                <WifiOff size={13} />
              )}

              {connectionStatus === "connected"
                ? "LIVE"
                : "CONNECTING"}
            </div>
          </div>

          <p
            className={`mt-1 text-sm ${
              isDark
                ? "text-slate-300"
                : "text-slate-700"
            }`}
          >
            Real-time market intelligence powered by
            TradeXen
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div
            className={`flex h-10 items-center gap-2 rounded-lg border px-3 ${
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-slate-300 bg-white"
            }`}
          >
            <Search
              size={16}
              className={
                isDark
                  ? "text-slate-400"
                  : "text-slate-600"
              }
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search symbol..."
              className={`w-40 bg-transparent text-sm outline-none ${
                isDark
                  ? "text-white placeholder:text-slate-400"
                  : "text-slate-950 placeholder:text-slate-600"
              }`}
            />
          </div>

          <button
            onClick={() => fetchQuotes(true)}
            disabled={refreshing}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
              isDark
                ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
            }`}
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          theme={theme}
          title="Market Pulse"
          value={
            averageChange === null
              ? "--"
              : `${averageChange >= 0 ? "+" : ""}${averageChange.toFixed(
                  2
                )}%`
          }
          subtitle="Average move"
          positive={
            averageChange === null
              ? null
              : averageChange >= 0
          }
          icon={Activity}
        />

        <SummaryCard
          theme={theme}
          title="Top Gainer"
          value={strongest?.symbol || "--"}
          subtitle={
            strongest?.quote
              ? `${getChangePercent(
                  strongest.quote.price,
                  strongest.quote.change
                ) >= 0
                  ? "+"
                  : ""}${getChangePercent(
                  strongest.quote.price,
                  strongest.quote.change
                )?.toFixed(2)}%`
              : "Waiting for data"
          }
          positive={true}
          icon={TrendingUp}
        />

        <SummaryCard
          theme={theme}
          title="Top Loser"
          value={weakest?.symbol || "--"}
          subtitle={
            weakest?.quote
              ? `${getChangePercent(
                  weakest.quote.price,
                  weakest.quote.change
                ) >= 0
                  ? "+"
                  : ""}${getChangePercent(
                  weakest.quote.price,
                  weakest.quote.change
                )?.toFixed(2)}%`
              : "Waiting for data"
          }
          positive={false}
          icon={TrendingDown}
        />

        <SummaryCard
          theme={theme}
          title="Tracked Stocks"
          value={MARKET_SYMBOLS.length}
          subtitle="Live instruments"
          positive={null}
          icon={BarChart3}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
            isDark
              ? "border-red-500/20 bg-red-500/10 text-red-300"
              : "border-red-300 bg-red-50 text-red-800"
          }`}
        >
          {error}
        </div>
      )}

      {/* Market Table */}
      <div
        className={`overflow-hidden rounded-xl border ${
          isDark
            ? "border-white/10 bg-white/[0.02]"
            : "border-slate-300 bg-white"
        }`}
      >
        <div
          className={`border-b px-5 py-4 ${
            isDark
              ? "border-white/10"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">
                Market Watch
              </h2>

              <p
                className={`mt-1 text-xs ${
                  isDark
                    ? "text-slate-300"
                    : "text-slate-700"
                }`}
              >
                Live prices and market activity
              </p>
            </div>

            <div
              className={`flex items-center gap-2 text-xs ${
                isDark
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                }`}
              />

              {connectionStatus === "connected"
                ? "Streaming"
                : "Connecting"}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr
                className={
                  isDark
                    ? "bg-white/[0.02] text-slate-300"
                    : "bg-slate-100 text-slate-700"
                }
              >
                <th className="px-5 py-3 text-left font-medium">
                  Instrument
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Price
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Change
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Change %
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Volume
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Day Range
                </th>

                <th className="px-5 py-3 text-right font-medium">
                  Momentum
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >
                    <div
                      className={`flex items-center justify-center gap-2 text-sm ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      <RefreshCw
                        size={15}
                        className="animate-spin"
                      />

                      Loading real market data...
                    </div>
                  </td>
                </tr>
              ) : marketRows.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className={`px-5 py-12 text-center text-sm ${
                      isDark
                        ? "text-slate-300"
                        : "text-slate-700"
                    }`}
                  >
                    No instruments found.
                  </td>
                </tr>
              ) : (
                marketRows.map((item) => {
                  const quote = item.quote;

                  const price =
                    quote?.price ?? null;

                  const change =
                    quote?.change ?? null;

                  const changePercent =
                    getChangePercent(
                      price,
                      change
                    );

                  const status =
                    getMarketStatus(changePercent);

                  const StatusIcon =
                    status.icon;

                  const high =
                    quote?.ohlc?.high;

                  const low =
                    quote?.ohlc?.low;

                  const positive =
                    change !== null
                      ? Number(change) >= 0
                      : null;

                  return (
                    <tr
                      key={item.symbol}
                      onClick={() =>
                        navigate(
                          `/terminal?symbol=${encodeURIComponent(
                            item.symbol
                          )}`
                        )
                      }
                      className={`cursor-pointer border-t transition ${
                        isDark
                          ? "border-white/5 hover:bg-white/[0.05]"
                          : "border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {/* Instrument */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                              isDark
                                ? "bg-indigo-500/10 text-indigo-400"
                                : "bg-indigo-50 text-indigo-700"
                            }`}
                          >
                            {item.symbol.slice(0, 2)}
                          </div>

                          <div>
                            <div className="font-semibold">
                              {item.symbol}
                            </div>

                            <div
                              className={`text-xs ${
                                isDark
                                  ? "text-slate-300"
                                  : "text-slate-700"
                              }`}
                            >
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4 text-right font-semibold">
                        {formatPrice(price)}
                      </td>

                      {/* Change */}
                      <td
                        className={`px-5 py-4 text-right font-medium ${
                          positive === true
                            ? "text-emerald-500"
                            : positive === false
                              ? "text-red-500"
                              : isDark
                                ? "text-slate-300"
                                : "text-slate-700"
                        }`}
                      >
                        {change === null
                          ? "--"
                          : `${
                              change >= 0
                                ? "+"
                                : ""
                            }${Number(change).toFixed(
                              2
                            )}`}
                      </td>

                      {/* Change % */}
                      <td
                        className={`px-5 py-4 text-right font-medium ${
                          positive === true
                            ? "text-emerald-500"
                            : positive === false
                              ? "text-red-500"
                              : isDark
                                ? "text-slate-300"
                                : "text-slate-700"
                        }`}
                      >
                        {changePercent === null
                          ? "--"
                          : `${
                              changePercent >= 0
                                ? "+"
                                : ""
                            }${changePercent.toFixed(
                              2
                            )}%`}
                      </td>

                      {/* Volume */}
                      <td
                        className={`px-5 py-4 text-right ${
                          isDark
                            ? "text-slate-200"
                            : "text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <Volume2
                            size={14}
                            className="opacity-60"
                          />

                          {formatVolume(
                            quote?.volume
                          )}
                        </div>
                      </td>

                      {/* Day Range */}
                      <td
                        className={`px-5 py-4 text-right text-xs ${
                          isDark
                            ? "text-slate-300"
                            : "text-slate-700"
                        }`}
                      >
                        {high !== null &&
                        high !== undefined &&
                        low !== null &&
                        low !== undefined
                          ? `${formatPrice(
                              low
                            )} — ${formatPrice(
                              high
                            )}`
                          : "--"}
                      </td>

                      {/* Momentum */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                              status.label ===
                                "Strong" ||
                              status.label ===
                                "Positive"
                                ? isDark
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-emerald-50 text-emerald-800"
                                : status.label ===
                                      "Weak" ||
                                    status.label ===
                                      "Negative"
                                  ? isDark
                                    ? "bg-red-500/10 text-red-400"
                                    : "bg-red-50 text-red-800"
                                  : isDark
                                    ? "bg-slate-500/10 text-slate-300"
                                    : "bg-slate-200 text-slate-800"
                            }`}
                          >
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  theme,
  title,
  value,
  subtitle,
  positive,
  icon: Icon,
}) {
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark
          ? "border-white/10 bg-white/[0.02]"
          : "border-slate-300 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`text-xs font-medium uppercase tracking-wider ${
            isDark
              ? "text-slate-300"
              : "text-slate-700"
          }`}
        >
          {title}
        </span>

        <Icon
          size={17}
          className={
            positive === true
              ? "text-emerald-500"
              : positive === false
                ? "text-red-500"
                : isDark
                  ? "text-slate-300"
                  : "text-slate-600"
          }
        />
      </div>

      <div className="text-xl font-bold">
        {value}
      </div>

      <div
        className={`mt-1 text-xs ${
          positive === true
            ? "text-emerald-500"
            : positive === false
              ? "text-red-500"
              : isDark
                ? "text-slate-300"
                : "text-slate-700"
        }`}
      >
        {subtitle}
      </div>
    </div>
  );
}

export default Markets;