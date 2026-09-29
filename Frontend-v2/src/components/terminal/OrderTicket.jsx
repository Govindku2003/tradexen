import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function OrderTicket() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("1");

  return (
    <div
      className={`rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`border-b px-4 py-3 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <h2
          className={`text-sm font-bold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Order Ticket
        </h2>

        <p
          className={`mt-0.5 text-[10px] ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          RELIANCE · NSE
        </p>
      </div>

      <div className="p-4">
        <div
          className={`mb-4 grid grid-cols-2 rounded-lg p-1 ${
            isDark ? "bg-slate-950" : "bg-slate-100"
          }`}
        >
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`rounded-md py-2 text-xs font-bold ${
              side === "BUY"
                ? "bg-emerald-500 text-white"
                : isDark
                  ? "text-slate-400"
                  : "text-slate-500"
            }`}
          >
            BUY
          </button>

          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`rounded-md py-2 text-xs font-bold ${
              side === "SELL"
                ? "bg-red-500 text-white"
                : isDark
                  ? "text-slate-400"
                  : "text-slate-500"
            }`}
          >
            SELL
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label
              className={`mb-1 block text-[10px] font-semibold ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              ORDER TYPE
            </label>

            <select
              className={`h-9 w-full rounded-lg border px-2 text-xs outline-none ${
                isDark
                  ? "border-slate-700 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
              defaultValue="MARKET"
            >
              <option>MARKET</option>
              <option>LIMIT</option>
              <option>STOP LOSS</option>
            </select>
          </div>

          <div>
            <label
              className={`mb-1 block text-[10px] font-semibold ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              QUANTITY
            </label>

            <input
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              type="number"
              min="1"
              className={`h-9 w-full rounded-lg border px-2 text-xs outline-none ${
                isDark
                  ? "border-slate-700 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            />
          </div>

          <div>
            <label
              className={`mb-1 block text-[10px] font-semibold ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              PRICE
            </label>

            <input
              type="text"
              defaultValue="₹2,955.40"
              readOnly
              className={`h-9 w-full rounded-lg border px-2 text-xs ${
                isDark
                  ? "border-slate-700 bg-slate-950 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-900"
              }`}
            />
          </div>

          <div
            className={`flex items-center justify-between border-t pt-3 ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <span
              className={`text-[10px] ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Estimated Value
            </span>

            <span
              className={`text-xs font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              ₹{(2955.4 * Number(quantity || 0)).toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                },
              )}
            </span>
          </div>

          <button
            type="button"
            className={`w-full rounded-lg py-2.5 text-xs font-bold text-white ${
              side === "BUY"
                ? "bg-emerald-500"
                : "bg-red-500"
            }`}
          >
            {side} RELIANCE
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderTicket;