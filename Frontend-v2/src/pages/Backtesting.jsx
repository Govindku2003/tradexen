import { useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { runBacktest } from "../services/api/backtestingApi";

const INSTRUMENTS = [
  {
    symbol: "RELIANCE",
    instrumentKey: "NSE_EQ|INE002A01018",
  },
  {
    symbol: "TCS",
    instrumentKey: "NSE_EQ|INE467B01029",
  },
  {
    symbol: "INFY",
    instrumentKey: "NSE_EQ|INE009A01021",
  },
  {
    symbol: "HDFCBANK",
    instrumentKey: "NSE_EQ|INE040A01034",
  },
  {
    symbol: "ICICIBANK",
    instrumentKey: "NSE_EQ|INE090A01021",
  },
];

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercent = (value) => {
  const number = Number(value || 0);

  return `${number.toFixed(2)}%`;
};

const Backtesting = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [symbol, setSymbol] =
    useState("NSE_EQ|INE002A01018");

  const [from, setFrom] =
    useState("2026-09-01");

  const [to, setTo] =
    useState("2026-10-01");

  const [initialCapital, setInitialCapital] =
    useState(100000);

  const [quantity, setQuantity] =
    useState(1);

  const [strategy, setStrategy] =
    useState("all");

  const [smaPeriod, setSmaPeriod] =
    useState(20);

  const [emaPeriod, setEmaPeriod] =
    useState(20);

  const [rsiPeriod, setRsiPeriod] =
    useState(14);

  const [macdFastPeriod, setMacdFastPeriod] =
    useState(12);

  const [macdSlowPeriod, setMacdSlowPeriod] =
    useState(26);

  const [macdSignalPeriod, setMacdSignalPeriod] =
    useState(9);

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const selectedSymbol = useMemo(
    () =>
      INSTRUMENTS.find(
        (item) =>
          item.instrumentKey === symbol
      ),
    [symbol]
  );

  const handleRunBacktest = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await runBacktest({
        instrumentKey: symbol,
        unit: "days",
        interval: "1",
        from,
        to,
        initialCapital:
          Number(initialCapital),
        quantity: Number(quantity),
       strategyKey: strategy,
        smaPeriod: Number(smaPeriod),
        emaPeriod: Number(emaPeriod),
        rsiPeriod: Number(rsiPeriod),
        macdFastPeriod:
          Number(macdFastPeriod),
        macdSlowPeriod:
          Number(macdSlowPeriod),
        macdSignalPeriod:
          Number(macdSignalPeriod),
      });

      setResult(data);
    } catch (err) {
      setResult(null);
      setError(
        err?.message ||
          "Unable to run backtest"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymbol(
      "NSE_EQ|INE002A01018"
    );

    setFrom("2026-09-01");
    setTo("2026-10-01");

    setInitialCapital(100000);
    setQuantity(1);

    setStrategy("all");

    setSmaPeriod(20);
    setEmaPeriod(20);
    setRsiPeriod(14);

    setMacdFastPeriod(12);
    setMacdSlowPeriod(26);
    setMacdSignalPeriod(9);

    setResult(null);
    setError("");
  };

  const inputClass = `
    w-full rounded-lg border px-3 py-2.5 text-sm
    outline-none transition
    ${
      isDark
        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-cyan-500"
        : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 focus:border-cyan-600"
    }
  `;

  const labelClass = `
    mb-1.5 block text-xs font-semibold uppercase tracking-wide
    ${
      isDark
        ? "text-slate-300"
        : "text-slate-700"
    }
  `;

  const cardClass = `
    rounded-xl border
    ${
      isDark
        ? "border-slate-800 bg-slate-900"
        : "border-slate-200 bg-white"
    }
  `;

  return (
    <section
      className={`
        min-h-[calc(100vh-4rem)]
        p-4 transition-colors duration-200
        sm:p-6
        ${
          isDark
            ? "bg-slate-950 text-white"
            : "bg-[#f5f7fa] text-slate-900"
        }
      `}
    >
      <div className="mx-auto max-w-[1700px] space-y-5">
        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className={`
                    flex h-10 w-10 items-center justify-center
                    rounded-lg
                    ${
                      isDark
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "bg-cyan-50 text-cyan-700"
                    }
                  `}
                >
                  <BarChart3
                    size={21}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Backtesting
                  </h1>

                  <p
                    className={`mt-1 text-sm ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    Test TradeXen strategies
                    against real historical
                    market data.
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`
                rounded-full border px-3 py-1.5 text-xs font-semibold
                ${
                  isDark
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }
              `}
            >
              REAL MARKET DATA
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className={`${cardClass} p-5`}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">
                Backtest Configuration
              </h2>

              <p
                className={`mt-1 text-xs ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Configure market, capital,
                dates and indicator parameters.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>
                Instrument
              </label>

              <select
                value={symbol}
                onChange={(e) =>
                  setSymbol(e.target.value)
                }
                className={inputClass}
              >
                {INSTRUMENTS.map(
                  (item) => (
                    <option
                      key={
                        item.instrumentKey
                      }
                      value={
                        item.instrumentKey
                      }
                    >
                      {item.symbol}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Initial Capital
              </label>

              <input
                type="number"
                min="1"
                value={initialCapital}
                onChange={(e) =>
                  setInitialCapital(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Strategy
              </label>

              <select
                value={strategy}
                onChange={(e) =>
                  setStrategy(e.target.value)
                }
                className={inputClass}
              >
                <option value="all">
                  All Strategies
                </option>
                <option value="rsi">
                  RSI
                </option>
                <option value="moving-average">
                  Moving Average
                </option>
                <option value="macd">
                  MACD
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                From
              </label>

              <input
                type="date"
                value={from}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                To
              </label>

              <input
                type="date"
                value={to}
                onChange={(e) =>
                  setTo(e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                SMA Period
              </label>

              <input
                type="number"
                min="1"
                value={smaPeriod}
                onChange={(e) =>
                  setSmaPeriod(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                EMA Period
              </label>

              <input
                type="number"
                min="1"
                value={emaPeriod}
                onChange={(e) =>
                  setEmaPeriod(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                RSI Period
              </label>

              <input
                type="number"
                min="1"
                value={rsiPeriod}
                onChange={(e) =>
                  setRsiPeriod(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                MACD Fast
              </label>

              <input
                type="number"
                min="1"
                value={macdFastPeriod}
                onChange={(e) =>
                  setMacdFastPeriod(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                MACD Slow
              </label>

              <input
                type="number"
                min="1"
                value={macdSlowPeriod}
                onChange={(e) =>
                  setMacdSlowPeriod(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                MACD Signal
              </label>

              <input
                type="number"
                min="1"
                value={macdSignalPeriod}
                onChange={(e) =>
                  setMacdSignalPeriod(
                    e.target.value
                  )
                }
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div
              className={`
                mt-4 rounded-lg border px-4 py-3
                text-sm
                ${
                  isDark
                    ? "border-red-500/20 bg-red-500/10 text-red-300"
                    : "border-red-200 bg-red-50 text-red-700"
                }
              `}
            >
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRunBacktest}
              disabled={loading}
              className="
                inline-flex items-center gap-2
                rounded-lg bg-cyan-600 px-5 py-2.5
                text-sm font-bold text-white
                transition hover:bg-cyan-500
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Play size={16} />

              {loading
                ? "Running..."
                : "Run Backtest"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className={`
                inline-flex items-center gap-2
                rounded-lg border px-5 py-2.5
                text-sm font-semibold
                ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                }
              `}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Empty state */}
        {!result && !loading && (
          <div
            className={`${cardClass} flex min-h-[280px] items-center justify-center p-8`}
          >
            <div className="text-center">
              <div
                className={`
                  mx-auto mb-4 flex h-14 w-14
                  items-center justify-center rounded-xl
                  ${
                    isDark
                      ? "bg-slate-800 text-cyan-400"
                      : "bg-slate-100 text-cyan-700"
                  }
                `}
              >
                <Activity size={25} />
              </div>

              <h3 className="text-lg font-bold">
                Ready to Backtest
              </h3>

              <p
                className={`mx-auto mt-2 max-w-md text-sm ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Select an instrument and date
                range, then run the strategy
                against real historical candles.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            className={`${cardClass} flex min-h-[280px] items-center justify-center`}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-500" />

              <p className="text-sm font-semibold">
                Running backtest...
              </p>

              <p
                className={`mt-1 text-xs ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Fetching historical market data
                and evaluating strategies.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  Backtest Results
                </h2>

                <p
                  className={`mt-1 text-xs ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {selectedSymbol?.symbol ||
                    symbol}{" "}
                  · {result.configuration.from}{" "}
                  →{" "}
                  {result.configuration.to}
                </p>
              </div>

              <div
                className={`
                  rounded-lg border px-3 py-2 text-xs font-semibold
                  ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-300"
                      : "border-slate-300 bg-white text-slate-700"
                  }
                `}
              >
                {result.candlesProcessed} candles
                processed
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                isDark={isDark}
                title="Final Equity"
                value={formatCurrency(
                  result.summary.finalEquity
                )}
                icon={BarChart3}
              />

              <MetricCard
                isDark={isDark}
                title="Total P&L"
                value={formatCurrency(
                  result.summary.totalPnL
                )}
                icon={
                  result.summary.totalPnL >= 0
                    ? TrendingUp
                    : TrendingDown
                }
                negative={
                  result.summary.totalPnL < 0
                }
              />

              <MetricCard
                isDark={isDark}
                title="Return"
                value={formatPercent(
                  result.summary.returnPercent
                )}
                icon={Activity}
                negative={
                  result.summary.returnPercent <
                  0
                }
              />

              <MetricCard
                isDark={isDark}
                title="Win Rate"
                value={formatPercent(
                  result.summary.winRate
                )}
                icon={Target}
              />

              <MetricCard
                isDark={isDark}
                title="Max Drawdown"
                value={formatPercent(
                  result.summary.maxDrawdown
                )}
                icon={ShieldAlert}
                negative={
                  result.summary.maxDrawdown >
                  0
                }
              />
            </div>

            {/* Equity Curve */}
            <EquityCurve
              data={result.equityCurve}
              isDark={isDark}
            />

            {/* Trade history */}
            <div className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-inherit px-5 py-4">
                <h3 className="font-bold">
                  Trade History
                </h3>

                <p
                  className={`mt-1 text-xs ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Executed simulated trades from
                  the historical period.
                </p>
              </div>

              {result.trades?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-left text-sm">
                    <thead
                      className={
                        isDark
                          ? "bg-slate-950"
                          : "bg-slate-50"
                      }
                    >
                      <tr>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                          Side
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                          Qty
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                          Entry
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                          Exit
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                          P&L
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                          Return
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">
                          Exit Reason
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {result.trades.map(
                        (trade, index) => (
                          <tr
                            key={`${trade.entryTime}-${index}`}
                            className={`border-t ${
                              isDark
                                ? "border-slate-800"
                                : "border-slate-200"
                            }`}
                          >
                            <td className="px-5 py-3">
                              <span
                                className={`
                                  rounded-md px-2 py-1
                                  text-xs font-bold
                                  ${
                                    trade.side ===
                                    "LONG"
                                      ? "bg-cyan-500/10 text-cyan-500"
                                      : "bg-red-500/10 text-red-500"
                                  }
                                `}
                              >
                                {trade.side}
                              </span>
                            </td>

                            <td className="px-5 py-3 font-semibold">
                              {trade.quantity}
                            </td>

                            <td className="px-5 py-3">
                              {formatCurrency(
                                trade.entryPrice
                              )}
                            </td>

                            <td className="px-5 py-3">
                              {formatCurrency(
                                trade.exitPrice
                              )}
                            </td>

                            <td
                              className={`px-5 py-3 font-bold ${
                                trade.pnl >= 0
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                            >
                              {formatCurrency(
                                trade.pnl
                              )}
                            </td>

                            <td
                              className={`px-5 py-3 font-semibold ${
                                trade.returnPercent >=
                                0
                                  ? "text-emerald-500"
                                  : "text-red-500"
                              }`}
                            >
                              {formatPercent(
                                trade.returnPercent
                              )}
                            </td>

                            <td className="px-5 py-3">
                              {trade.signal}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  className={`px-5 py-10 text-center text-sm ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  No completed trades were
                  generated for this period.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

const MetricCard = ({
  isDark,
  title,
  value,
  icon: Icon,
  negative = false,
}) => {
  return (
    <div
      className={`
        rounded-xl border p-4
        ${
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold ${
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }`}
        >
          {title}
        </span>

        <Icon
          size={17}
          className={
            negative
              ? "text-red-500"
              : "text-cyan-500"
          }
        />
      </div>

      <div
        className={`mt-3 text-xl font-bold ${
          negative
            ? "text-red-500"
            : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
};

const EquityCurve = ({
  data,
  isDark,
}) => {
  if (!data?.length) {
    return null;
  }

  const width = 1000;
  const height = 300;

  const values = data.map(
    (item) => Number(item.equity)
  );

  const min = Math.min(...values);
  const max = Math.max(...values);

  const range =
    max - min || 1;

  const points = data
    .map((item, index) => {
      const x =
        (index /
          Math.max(data.length - 1, 1)) *
        width;

      const y =
        height -
        ((Number(item.equity) - min) /
          range) *
          (height - 30) -
        15;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className={`
        rounded-xl border p-5
        ${
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div className="mb-4">
        <h3 className="font-bold">
          Equity Curve
        </h3>

        <p
          className={`mt-1 text-xs ${
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }`}
        >
          Portfolio equity through the
          backtest period.
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[280px] min-w-[800px] w-full"
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            points={points}
            className="text-cyan-500"
          />
        </svg>
      </div>

      <div className="mt-3 flex justify-between text-xs">
        <span
          className={
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }
        >
          {data[0]?.timestamp
            ? new Date(
                data[0].timestamp
              ).toLocaleDateString(
                "en-IN"
              )
            : ""}
        </span>

        <span
          className={
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }
        >
          {data[data.length - 1]
            ?.timestamp
            ? new Date(
                data[
                  data.length - 1
                ].timestamp
              ).toLocaleDateString(
                "en-IN"
              )
            : ""}
        </span>
      </div>
    </div>
  );
};

export default Backtesting;