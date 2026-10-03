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
   * Backend/Upstox:
   * newest -> oldest
   *
   * Chart:
   * oldest -> newest
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

  /*
   * PRICE CHART RANGE
   *
   * Include candles + SMA + EMA.
   */
  const smaValues = validCandles
    .map((candle) => Number(candle?.indicators?.sma))
    .filter(Number.isFinite);

  const emaValues = validCandles
    .map((candle) => Number(candle?.indicators?.ema))
    .filter(Number.isFinite);

  const allHighValues = [
    ...validCandles.map((candle) =>
      Number(candle.high),
    ),
    ...smaValues,
    ...emaValues,
  ];

  const allLowValues = [
    ...validCandles.map((candle) =>
      Number(candle.low),
    ),
    ...smaValues,
    ...emaValues,
  ];

  const chartHigh =
    allHighValues.length > 0
      ? Math.max(...allHighValues)
      : null;

  const chartLow =
    allLowValues.length > 0
      ? Math.min(...allLowValues)
      : null;

  const chartRange =
    chartHigh !== null &&
    chartLow !== null &&
    chartHigh !== chartLow
      ? chartHigh - chartLow
      : 1;

  const getY = (value) => {
    if (
      chartHigh === null ||
      chartLow === null
    ) {
      return 50;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return 50;
    }

    const normalized =
      (chartHigh - numericValue) / chartRange;

    return 8 + normalized * 84;
  };

  /*
   * SMA / EMA SVG points
   */
  const createIndicatorPoints = (indicatorName) =>
    validCandles
      .map((candle, index) => {
        const value =
          candle?.indicators?.[indicatorName];

        const numericValue = Number(value);

        if (!Number.isFinite(numericValue)) {
          return null;
        }

        const x =
          ((index + 0.5) /
            validCandles.length) *
          100;

        const y = getY(numericValue);

        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(" ");

  const smaPoints =
    createIndicatorPoints("sma");

  const emaPoints =
    createIndicatorPoints("ema");

  /*
   * RSI
   *
   * RSI has a fixed 0-100 range.
   */
  const getRSIY = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return null;
    }

    return 5 + ((100 - numericValue) / 100) * 90;
  };

  const rsiPoints = validCandles
    .map((candle, index) => {
      const value =
        candle?.indicators?.rsi;

      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        return null;
      }

      const x =
        ((index + 0.5) /
          validCandles.length) *
        100;

      const y = getRSIY(numericValue);

      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");

  /*
   * MACD values
   */
  const macdValues = validCandles
    .map((candle) => ({
      macd: Number(
        candle?.indicators?.macd?.macdLine,
      ),
      signal: Number(
        candle?.indicators?.macd?.signalLine,
      ),
      histogram: Number(
        candle?.indicators?.macd?.histogram,
      ),
    }))
    .filter(
      (item) =>
        Number.isFinite(item.macd) ||
        Number.isFinite(item.signal) ||
        Number.isFinite(item.histogram),
    );

  const macdNumbers = macdValues.flatMap(
    (item) =>
      [
        item.macd,
        item.signal,
        item.histogram,
      ].filter(Number.isFinite),
  );

  const macdMax =
    macdNumbers.length > 0
      ? Math.max(...macdNumbers, 0)
      : 1;

  const macdMin =
    macdNumbers.length > 0
      ? Math.min(...macdNumbers, 0)
      : -1;

  const macdRange =
    macdMax !== macdMin
      ? macdMax - macdMin
      : 1;

  const getMACDY = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return null;
    }

    const normalized =
      (macdMax - numericValue) /
      macdRange;

    return 5 + normalized * 90;
  };

  const createMACDPoints = (field) =>
    validCandles
      .map((candle, index) => {
        const value = Number(
          candle?.indicators?.macd?.[field],
        );

        if (!Number.isFinite(value)) {
          return null;
        }

        const x =
          ((index + 0.5) /
            validCandles.length) *
          100;

        const y = getMACDY(value);

        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(" ");

  const macdLinePoints =
    createMACDPoints("macdLine");

  const macdSignalPoints =
    createMACDPoints("signalLine");

  /*
   * Latest indicator values
   */
  const latestCandle =
    validCandles.length > 0
      ? validCandles[
          validCandles.length - 1
        ]
      : null;

  const latestSMA = Number(
    latestCandle?.indicators?.sma,
  );

  const latestEMA = Number(
    latestCandle?.indicators?.ema,
  );

  const latestRSI = Number(
    latestCandle?.indicators?.rsi,
  );

  const latestMACD =
    latestCandle?.indicators?.macd;

  /*
   * Time labels
   */
  const labelIndexes = [];

  if (validCandles.length > 0) {
    const count = Math.min(
      6,
      validCandles.length,
    );

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
      {/* HEADER */}
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

          {/* Indicator Summary */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px]">
            {Number.isFinite(latestSMA) && (
              <span className="font-medium text-amber-500">
                SMA 20:{" "}
                {formatPrice(latestSMA)}
              </span>
            )}

            {Number.isFinite(latestEMA) && (
              <span className="font-medium text-violet-400">
                EMA 20:{" "}
                {formatPrice(latestEMA)}
              </span>
            )}

            {Number.isFinite(latestRSI) && (
              <span className="font-medium text-cyan-400">
                RSI 14:{" "}
                {latestRSI.toFixed(2)}
              </span>
            )}

            {latestMACD &&
              Number.isFinite(
                Number(
                  latestMACD.macdLine,
                ),
              ) && (
                <span className="font-medium text-slate-400">
                  MACD:{" "}
                  {Number(
                    latestMACD.macdLine,
                  ).toFixed(2)}
                </span>
              )}
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
                    setSelectedTimeframe(
                      period,
                    )
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

      {/* ALL CHART PANELS */}
      <div className="space-y-2 p-3">

        {/* ================= MAIN PRICE CHART ================= */}
        <div className="relative h-[300px] overflow-hidden">
          <div
            className={`absolute inset-0 overflow-hidden rounded-lg ${
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

            {/* Candles */}
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

                    const candleWidth =
                      Math.max(
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

                    const bodyTop =
                      Math.min(
                        openY,
                        closeY,
                      );

                    const bodyHeight =
                      Math.max(
                        Math.abs(
                          closeY - openY,
                        ),
                        1,
                      );

                    const positive =
                      closeValue >=
                      openValue;

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
                      sma:
                        candle?.indicators?.sma,
                      ema:
                        candle?.indicators?.ema,
                      rsi:
                        candle?.indicators?.rsi,
                      macd:
                        candle?.indicators?.macd,
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
                          setHoveredCandle(
                            null,
                          )
                        }
                        className="cursor-crosshair"
                      >
                        {/* Wick */}
                        <line
                          x1={x}
                          x2={x}
                          y1={highY}
                          y2={lowY}
                          stroke={
                            candleColor
                          }
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
                          fill={
                            candleColor
                          }
                          rx="0.3"
                        />

                        {/* Hover */}
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

                {/* SMA */}
                {smaPoints && (
                  <polyline
                    points={smaPoints}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                {/* EMA */}
                {emaPoints && (
                  <polyline
                    points={emaPoints}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </svg>
            )}

            {/* Current Price */}
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
                {labelIndexes.map(
                  (index) => {
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
                        {formatTime(
                          candle.timestamp,
                        )}
                      </span>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* Main Loading */}
          {historicalLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div
                className={`rounded-lg px-3 py-2 text-xs font-medium ${
                  isDark
                    ? "bg-slate-900 text-slate-400"
                    : "bg-white text-slate-500"
                }`}
              >
                Loading market data...
              </div>
            </div>
          )}

          {/* Main Error */}
          {!historicalLoading &&
            historicalError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-center text-xs text-red-500">
                  {historicalError}
                </div>
              </div>
            )}
        </div>

        {/* ================= RSI PANEL ================= */}
        <div
          className={`relative h-[95px] overflow-hidden rounded-lg border ${
            isDark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          {/* RSI Label */}
          <div className="absolute left-2 top-2 z-10 flex items-center gap-2 text-[9px]">
            <span className="font-semibold text-cyan-400">
              RSI 14
            </span>

            {Number.isFinite(latestRSI) && (
              <span className="text-slate-400">
                {latestRSI.toFixed(2)}
              </span>
            )}
          </div>

          {/* RSI 70 */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-red-500/40"
            style={{ top: "32%" }}
          >
            <span className="absolute right-1 -top-3 text-[8px] text-red-400">
              70
            </span>
          </div>

          {/* RSI 50 */}
          <div
            className={`absolute left-0 right-0 border-t ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }`}
            style={{ top: "50%" }}
          />

          {/* RSI 30 */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-emerald-500/40"
            style={{ top: "68%" }}
          >
            <span className="absolute right-1 -top-3 text-[8px] text-emerald-400">
              30
            </span>
          </div>

          {rsiPoints && (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              <polyline
                points={rsiPoints}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </div>

        {/* ================= MACD PANEL ================= */}
        <div
          className={`relative h-[105px] overflow-hidden rounded-lg border ${
            isDark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          {/* MACD Header */}
          <div className="absolute left-2 top-2 z-10 flex items-center gap-3 text-[9px]">
            <span className="font-semibold text-slate-300">
              MACD 12,26,9
            </span>

            {latestMACD &&
              Number.isFinite(
                Number(
                  latestMACD.macdLine,
                ),
              ) && (
                <span className="text-cyan-400">
                  MACD:{" "}
                  {Number(
                    latestMACD.macdLine,
                  ).toFixed(2)}
                </span>
              )}

            {latestMACD &&
              Number.isFinite(
                Number(
                  latestMACD.signalLine,
                ),
              ) && (
                <span className="text-amber-400">
                  Signal:{" "}
                  {Number(
                    latestMACD.signalLine,
                  ).toFixed(2)}
                </span>
              )}
          </div>

          {/* Zero Line */}
          {macdNumbers.length > 0 && (
            <div
              className={`absolute left-0 right-0 border-t ${
                isDark
                  ? "border-slate-700"
                  : "border-slate-300"
              }`}
              style={{
                top: `${getMACDY(0)}%`,
              }}
            />
          )}

          {/* MACD Histogram */}
          {validCandles.length > 0 && (
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
            >
              {validCandles.map(
                (candle, index) => {
                  const histogram =
                    Number(
                      candle?.indicators
                        ?.macd?.histogram,
                    );

                  if (
                    !Number.isFinite(
                      histogram,
                    )
                  ) {
                    return null;
                  }

                  const x =
                    ((index + 0.5) /
                      validCandles.length) *
                    100;

                  const zeroY =
                    getMACDY(0);

                  const valueY =
                    getMACDY(histogram);

                  const top =
                    Math.min(
                      zeroY,
                      valueY,
                    );

                  const height =
                    Math.max(
                      Math.abs(
                        valueY - zeroY,
                      ),
                      0.6,
                    );

                  const positive =
                    histogram >= 0;

                  return (
                    <rect
                      key={`macd-hist-${index}`}
                      x={
                        x -
                        Math.max(
                          0.35,
                          30 /
                            validCandles.length,
                        ) /
                          2
                      }
                      y={top}
                      width={Math.max(
                        0.35,
                        30 /
                          validCandles.length,
                      )}
                      height={height}
                      fill={
                        positive
                          ? "#10b981"
                          : "#ef4444"
                      }
                      opacity="0.55"
                    />
                  );
                },
              )}

              {/* MACD Line */}
              {macdLinePoints && (
                <polyline
                  points={macdLinePoints}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="0.9"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Signal Line */}
              {macdSignalPoints && (
                <polyline
                  points={macdSignalPoints}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.9"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
          )}
        </div>
      </div>

      {/* OHLC / Indicator Tooltip */}
      {hoveredCandle && (
        <div
          className={`absolute left-3 top-[100px] z-50 min-w-[210px] rounded-lg border p-3 shadow-xl ${
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

          <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-[10px]">
            <span>
              Open{" "}
              <strong>
                ₹{formatPrice(
                  hoveredCandle.open,
                )}
              </strong>
            </span>

            <span>
              High{" "}
              <strong className="text-emerald-500">
                ₹{formatPrice(
                  hoveredCandle.high,
                )}
              </strong>
            </span>

            <span>
              Low{" "}
              <strong className="text-red-500">
                ₹{formatPrice(
                  hoveredCandle.low,
                )}
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
                ₹{formatPrice(
                  hoveredCandle.close,
                )}
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

          <div
            className={`mt-2 grid grid-cols-2 gap-1 border-t pt-2 text-[10px] ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            {Number.isFinite(
              Number(hoveredCandle.sma),
            ) && (
              <span className="text-amber-500">
                SMA:{" "}
                {formatPrice(
                  hoveredCandle.sma,
                )}
              </span>
            )}

            {Number.isFinite(
              Number(hoveredCandle.ema),
            ) && (
              <span className="text-violet-400">
                EMA:{" "}
                {formatPrice(
                  hoveredCandle.ema,
                )}
              </span>
            )}

            {Number.isFinite(
              Number(hoveredCandle.rsi),
            ) && (
              <span className="text-cyan-400">
               RSI:{" "}
{Number(hoveredCandle.rsi).toFixed(2)}
              </span>
            )}

            {hoveredCandle.macd &&
              Number.isFinite(
                Number(
                  hoveredCandle.macd.macdLine,
                ),
              ) && (
                <span className="text-slate-400">
                 MACD:{" "}
{Number(
  hoveredCandle.macd.macdLine,
).toFixed(2)}
                </span>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartPanel;  