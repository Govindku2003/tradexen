
import {
  BarChart3,
  Maximize2,
  MoreHorizontal,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const candles = [
  [40, 80, 60, 95],
  [48, 75, 55, 90],
  [55, 70, 45, 82],
  [62, 78, 50, 88],
  [70, 82, 58, 92],
  [78, 76, 52, 86],
  [86, 68, 45, 80],
  [94, 72, 48, 84],
  [102, 64, 42, 76],
  [110, 70, 45, 82],
  [118, 60, 38, 74],
  [126, 66, 40, 78],
];

function ChartPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`h-full rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-3 py-3 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={`text-sm font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              RELIANCE
            </h2>

            <span className="text-[10px] text-emerald-500">
              NSE
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              ₹2,955.40
            </span>

            <span className="text-xs font-semibold text-emerald-500">
              +1.32%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {["1D", "1W", "1M", "3M", "1Y"].map(
            (period) => (
              <button
                type="button"
                key={period}
                className={`rounded px-2 py-1 text-[10px] font-semibold ${
                  period === "1D"
                    ? "bg-cyan-500/10 text-cyan-600"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                }`}
              >
                {period}
              </button>
            ),
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

      <div className="relative h-[360px] overflow-hidden p-3">
        <div
          className={`absolute inset-3 rounded-lg ${
            isDark ? "bg-slate-950" : "bg-slate-50"
          }`}
        >
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
            {Array.from({ length: 42 }).map((_, index) => (
              <div
                key={index}
                className={`border-r border-b ${
                  isDark
                    ? "border-slate-800/60"
                    : "border-slate-200/70"
                }`}
              />
            ))}
          </div>

          <svg
            viewBox="0 0 140 100"
            className="absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)]"
            preserveAspectRatio="none"
          >
            {candles.map(
              ([x, high, low, close], index) => {
                const open =
                  index === 0
                    ? 72
                    : candles[index - 1][3];

                const isPositive = close >= open;

                return (
                  <g key={index}>
                    <line
                      x1={x}
                      x2={x}
                      y1={high}
                      y2={low}
                      stroke={
                        isPositive
                          ? "#10b981"
                          : "#ef4444"
                      }
                      strokeWidth="0.8"
                    />

                    <rect
                      x={x - 2}
                      y={Math.min(open, close)}
                      width="4"
                      height={Math.max(
                        Math.abs(close - open),
                        2,
                      )}
                      fill={
                        isPositive
                          ? "#10b981"
                          : "#ef4444"
                      }
                    />
                  </g>
                );
              },
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default ChartPanel;