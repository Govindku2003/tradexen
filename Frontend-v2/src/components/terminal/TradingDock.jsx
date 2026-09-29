import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const positions = [
  {
    symbol: "RELIANCE",
    qty: 10,
    avg: "2,920.50",
    ltp: "2,955.40",
    pnl: "+349.00",
  },
  {
    symbol: "TCS",
    qty: 5,
    avg: "3,390.00",
    ltp: "3,421.85",
    pnl: "+159.25",
  },
];

function TradingDock() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tab, setTab] = useState("positions");

  return (
    <div
      className={`mt-3 rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex items-center gap-5 border-b px-4 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        {[
          ["positions", "Positions"],
          ["orders", "Orders"],
          ["trades", "Trades"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => setTab(value)}
            className={`border-b-2 py-3 text-xs font-semibold ${
              tab === value
                ? "border-cyan-500 text-cyan-600"
                : `border-transparent ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "positions" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left">
            <thead>
              <tr
                className={`text-[10px] ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                <th className="px-4 py-3">SYMBOL</th>
                <th className="px-4 py-3">QTY</th>
                <th className="px-4 py-3">AVG</th>
                <th className="px-4 py-3">LTP</th>
                <th className="px-4 py-3">P&L</th>
              </tr>
            </thead>

            <tbody>
              {positions.map((position) => (
                <tr
                  key={position.symbol}
                  className={`border-t text-xs ${
                    isDark
                      ? "border-slate-800"
                      : "border-slate-100"
                  }`}
                >
                  <td
                    className={`px-4 py-3 font-bold ${
                      isDark
                        ? "text-slate-200"
                        : "text-slate-800"
                    }`}
                  >
                    {position.symbol}
                  </td>

                  <td className="px-4 py-3">
                    {position.qty}
                  </td>

                  <td className="px-4 py-3">
                    ₹{position.avg}
                  </td>

                  <td className="px-4 py-3">
                    ₹{position.ltp}
                  </td>

                  <td className="px-4 py-3 font-semibold text-emerald-500">
                    ₹{position.pnl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== "positions" && (
        <div
          className={`flex h-28 items-center justify-center text-xs ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          {tab === "orders"
            ? "Orders will appear here"
            : "Executed trades will appear here"}
        </div>
      )}
    </div>
  );
}

export default TradingDock;