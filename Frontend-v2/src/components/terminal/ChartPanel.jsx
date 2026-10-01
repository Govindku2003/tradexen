import { useState } from "react";
import {
  BarChart3,
  Maximize2,
  MoreHorizontal,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useTerminal } from "../../context/TerminalContext";

const formatPrice = (value) => {
  if (value === null || value === undefined) {
    return "--";
  }

  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) {
    return "--";
  }

  const date = new Date(timestamp);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDateTime = (timestamp) => {
  if (!timestamp) {
    return "--";
  }

  const date = new Date(timestamp);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

function ChartPanel() {
  const { theme } = useTheme();

 const {
  selectedSymbol,
  selectedQuote,
  quoteLoading,
  historicalCandles,
  historicalLoading,
  historicalError,
  selectedTimeframe,
  setSelectedTimeframe,
} = useTerminal();

  const isDark = theme === "dark";

  const [hoveredCandle, setHoveredCandle] =
    useState(null);

  const price = selectedQuote?.price ?? null;
  const change = selectedQuote?.change ?? null;

  const previousPrice =
    price !== null && change !== null
      ? price - change
      : null;

  const changePercent =
    previousPrice !== null && previousPrice !== 0
      ? (change / previousPrice) * 100
      : null;

  const isPositive =
    change !== null ? change >= 0 : true;

  const formattedPrice =
    price !== null
      ? `₹${formatPrice(price)}`
      : "--";

  const formattedChange =
    change !== null
      ? `${change >= 0 ? "+" : ""}${Number(
          change,
        ).toFixed(2)}`
      : "--";

  const formattedChangePercent =
    changePercent !== null
      ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(
          2,
        )}%`
      : "--";

  /*
    Upstox returns:
    newest -> oldest

    Chart needs:
    oldest -> newest
  */
  const chartCandles = [...(historicalCandles || [])]
    .reverse()
    .slice(-40);

  const validCandles = chartCandles.filter(
  (candle) =>
    candle &&
    candle.timestamp &&
    Number.isFinite(Number(candle.open)) &&
    Number.isFinite(Number(candle.high)) &&
    Number.isFinite(Number(candle.low)) &&
    Number.isFinite(Number(candle.close)),
);

 const chartHigh =
  validCandles.length > 0
    ? Math.max(
        ...validCandles.map((candle) =>
          Number(candle.high),
        ),
      )
    : null;

  const chartLow =
  validCandles.length > 0
    ? Math.min(
        ...validCandles.map((candle) =>
          Number(candle.low),
        ),
      )
    : null;

  const chartRange =
    chartHigh !== null &&
    chartLow !== null &&
    chartHigh !== chartLow
      ? chartHigh - chartLow
      : 1;

  const getY = (value) => {
    if (chartHigh === null) {
      return 50;
    }

    const normalized =
      (chartHigh - value) / chartRange;

    return 8 + normalized * 84;
  };

  /*
    Show around 6 time labels along the chart.
  */
  const labelIndexes = [];

  if (validCandles.length > 0) {
    const count = Math.min(6, validCandles.length);

    for (let i = 0; i < count; i += 1) {
      const index =
        count === 1
          ? 0
          : Math.round(
              (i *
                (validCandles.length - 1)) /
                (count - 1),
            );

      labelIndexes.push(index);
    }
  }

  return (
    <div
      className={`h-full rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-3 py-3 ${
          isDark
            ? "border-slate-800"
            : "border-slate-200"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={`text-sm font-bold ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {selectedSymbol?.symbol || "--"}
            </h2>

            <span className="text-[10px] text-emerald-500">
              NSE
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {quoteLoading
                ? "Loading..."
                : formattedPrice}
            </span>

            <span
              className={`text-xs font-semibold ${
                isPositive
                  ? "text-emerald-500"
                  : "text-red-500"
              }`}
            >
              {quoteLoading
                ? "--"
                : `${formattedChange} (${formattedChangePercent})`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
         {["1D", "1W", "1M", "3M", "1Y"].map(
  (period) => {
    const isSelected =
      selectedTimeframe === period;

    return (
      <button
        type="button"
        key={period}
        onClick={() =>
          setSelectedTimeframe(period)
        }
        disabled={
          historicalLoading ||
          selectedTimeframe === period
        }
        className={`rounded px-2 py-1 text-[10px] font-semibold ${
          isSelected
            ? "bg-cyan-500/10 text-cyan-600"
            : isDark
              ? "text-slate-400"
              : "text-slate-500"
        } disabled:cursor-default`}
      >
        {period}
      </button>
    );
  },
)}

          <button
            type="button"
            className="ml-1 p-1 text-slate-500"
            title="Chart settings"
          >
            <BarChart3 size={15} />
          </button>

          <button
            type="button"
            className="p-1 text-slate-500"
            title="Fullscreen"
          >
            <Maximize2 size={15} />
          </button>

          <button
            type="button"
            className="p-1 text-slate-500"
            title="More"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[360px] overflow-hidden p-3">
        <div
          className={`absolute inset-3 overflow-hidden rounded-lg ${
            isDark
              ? "bg-slate-950"
              : "bg-slate-50"
          }`}
        >
          {/* Grid */}
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
            {Array.from({ length: 42 }).map(
              (_, index) => (
                <div
                  key={index}
                  className={`border-r border-b ${
                    isDark
                      ? "border-slate-800/60"
                      : "border-slate-200/70"
                  }`}
                />
              ),
            )}
          </div>

          {/* Loading */}
          {historicalLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  isDark
                    ? "bg-slate-900 text-slate-400"
                    : "bg-white text-slate-500"
                }`}
              >
                Loading historical candles...
              </div>
            </div>
          )}

          {/* Error */}
          {!historicalLoading &&
            historicalError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-center text-xs text-red-500">
                  {historicalError}
                </div>
              </div>
            )}

          {/* Empty */}
          {!historicalLoading &&
            !historicalError &&
            validCandles.length === 0 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <span
                  className={`text-xs ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  No historical candle data
                </span>
              </div>
            )}

          {/* OHLC Tooltip */}
          {hoveredCandle && (
            <div
              className={`absolute left-3 top-3 z-30 min-w-[190px] rounded-lg border p-3 shadow-xl ${
                isDark
                  ? "border-slate-700 bg-slate-900/95"
                  : "border-slate-200 bg-white/95"
              }`}
            >
              <div
                className={`text-[10px] font-semibold ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {formatDateTime(
                  hoveredCandle.timestamp,
                )}
              </div>

              <div
                className={`mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-[10px] ${
                  isDark
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                <span>
                  Open{" "}
                  <strong className="text-slate-100 dark:text-white">
                    ₹{formatPrice(hoveredCandle.open)}
                  </strong>
                </span>

                <span>
                  High{" "}
                  <strong className="text-emerald-500">
                    ₹{formatPrice(hoveredCandle.high)}
                  </strong>
                </span>

                <span>
                  Low{" "}
                  <strong className="text-red-500">
                    ₹{formatPrice(hoveredCandle.low)}
                  </strong>
                </span>

                <span>
                  Close{" "}
                  <strong
                    className={
                      hoveredCandle.close >=
                      hoveredCandle.open
                        ? "text-emerald-500"
                        : "text-red-500"
                    }
                  >
                    ₹{formatPrice(hoveredCandle.close)}
                  </strong>
                </span>
              </div>

              <div
                className={`mt-2 border-t pt-2 text-[10px] ${
                  isDark
                    ? "border-slate-800 text-slate-500"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                Volume:{" "}
                {Number(
                  hoveredCandle.volume || 0,
                ).toLocaleString("en-IN")}
              </div>
            </div>
          )}

          {/* Real Candles */}
          {validCandles.length > 0 && (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-7 h-[calc(100%-3.5rem)] w-[calc(100%-3.5rem)]"
              preserveAspectRatio="none"
            >
              {validCandles.map(
                (candle, index) => {
                  const {
  timestamp,
  open,
  high,
  low,
  close,
  volume,
} = candle;

                  const openValue =
                    Number(open);
                  const highValue =
                    Number(high);
                  const lowValue =
                    Number(low);
                  const closeValue =
                    Number(close);

                  const x =
                    ((index + 0.5) /
                      validCandles.length) *
                    100;

                  const candleWidth = Math.max(
                    0.7,
                    Math.min(
                      2.2,
                      70 /
                        validCandles.length,
                    ),
                  );

                  const openY =
                    getY(openValue);

                  const highY =
                    getY(highValue);

                  const lowY =
                    getY(lowValue);

                  const closeY =
                    getY(closeValue);

                  const bodyTop = Math.min(
                    openY,
                    closeY,
                  );

                  const bodyHeight = Math.max(
                    Math.abs(
                      closeY - openY,
                    ),
                    1,
                  );

                  const positive =
                    closeValue >= openValue;

                  const candleColor =
                    positive
                      ? "#10b981"
                      : "#ef4444";

                  const tooltipData = {
  timestamp,
  open: openValue,
  high: highValue,
  low: lowValue,
  close: closeValue,
  volume,
};

                  return (
                    <g
                      key={`${timestamp}-${index}`}
                      onMouseEnter={() =>
                        setHoveredCandle(
                          tooltipData,
                        )
                      }
                      onMouseLeave={() =>
                        setHoveredCandle(null)
                      }
                      className="cursor-crosshair"
                    >
                      {/* Wick */}
                      <line
                        x1={x}
                        x2={x}
                        y1={highY}
                        y2={lowY}
                        stroke={candleColor}
                        strokeWidth="0.45"
                      />

                      {/* Body */}
                      <rect
                        x={
                          x -
                          candleWidth / 2
                        }
                        y={bodyTop}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={candleColor}
                        rx="0.3"
                      />

                      {/* Invisible hover area */}
                      <rect
                        x={
                          x -
                          50 /
                            validCandles.length
                        }
                        y="0"
                        width={
                          100 /
                            validCandles.length
                        }
                        height="100"
                        fill="transparent"
                      />
                    </g>
                  );
                },
              )}
            </svg>
          )}

          {/* Current Price Line */}
          {price !== null &&
            chartHigh !== null &&
            chartLow !== null && (
              <div
                className="absolute left-0 right-0 flex items-center"
                style={{
                  top: `${getY(price)}%`,
                }}
              >
                <div className="flex-1 border-t border-dashed border-emerald-500" />

                <span className="rounded-l-md bg-emerald-500 px-2 py-1 text-[9px] font-bold text-white">
                  {formatPrice(price)}
                </span>
              </div>
            )}

          {/* Time Axis */}
          {validCandles.length > 0 && (
            <div className="absolute bottom-1 left-7 right-7 flex justify-between">
              {labelIndexes.map((index) => {
                const candle =
                  validCandles[index];

                return (
                  <span
                    key={`${candle.timestamp}-${index}`}
                    className={`text-[9px] ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                   {formatTime(candle.timestamp)}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChartPanel;