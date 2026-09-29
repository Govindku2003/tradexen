import { TrendingUp } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function MarketIntelligence() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex items-center gap-2 border-b px-4 py-3 ${
          isDark
            ? "border-slate-800"
            : "border-slate-200"
        }`}
      >
        <TrendingUp
          size={15}
          className="text-cyan-500"
        />

        <h2
          className={`text-sm font-bold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Market Intelligence
        </h2>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] text-slate-500">
            Market Trend
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-500">
            Bullish
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-500">
            Volatility
          </p>
          <p
            className={`mt-1 text-sm font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Moderate
          </p>
        </div>

        <div>
          <p className="text-[10px] text-slate-500">
            Signal
          </p>
          <p className="mt-1 text-sm font-bold text-cyan-600">
            Monitoring
          </p>
        </div>
      </div>
    </div>
  );
}

export default MarketIntelligence;