import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useTerminal } from "../../context/TerminalContext";
import {
  createOrder,
  executeOrder,
} from "../../services/api/orderApi";

function OrderTicket() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("1");

  const [orderType, setOrderType] = useState("MARKET");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
    selectedSymbol,
    selectedQuote,
    quoteLoading,
  } = useTerminal();

  const price = selectedQuote?.price ?? null;

  const numericQuantity = Math.max(
    0,
    Number(quantity || 0),
  );

  const estimatedValue =
    price !== null
      ? price * numericQuantity
      : 0;

  const formattedPrice =
    price !== null
      ? `₹${Number(price).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "--";

  const formattedEstimatedValue =
    price !== null
      ? `₹${estimatedValue.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "--";

  const handleOrder = async () => {
    setMessage("");
    setError("");

    if (!selectedSymbol?.symbol) {
      setError("Please select a trading symbol.");
      return;
    }

    if (!Number.isInteger(numericQuantity) || numericQuantity < 1) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      setError("Valid market price is required.");
      return;
    }

    try {
      setSubmitting(true);

      const createResponse = await createOrder({
        symbol: selectedSymbol.symbol,
        side,
        orderType,
        quantity: numericQuantity,
        requestedPrice: Number(price),
        source: "MANUAL",
        stopLoss: null,
        takeProfit: null,
        strategy: null,
      });

      const createdOrder =
        createResponse?.data?.order;

      if (!createdOrder?._id) {
        throw new Error(
          "Order was created but order ID was not returned.",
        );
      }

      const executionResponse =
        await executeOrder(createdOrder._id);

      const result =
        executionResponse?.data;

      window.dispatchEvent(
        new CustomEvent("tradexen:order-executed", {
          detail: result,
        }),
      );

      setMessage(
        `${side} order executed successfully.`,
      );

      setQuantity("1");
    } catch (err) {
      console.error("Order execution error:", err);

      setError(
        err.message ||
          "Unable to execute paper order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          isDark
            ? "border-slate-800"
            : "border-slate-200"
        }`}
      >
        <h2
          className={`text-sm font-bold ${
            isDark
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Paper Order Ticket
        </h2>

        <p
          className={`mt-0.5 text-[10px] ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        >
          {selectedSymbol?.symbol || "--"} · NSE
        </p>
      </div>

      <div className="p-4">
        <div
          className={`mb-4 grid grid-cols-2 rounded-lg p-1 ${
            isDark
              ? "bg-slate-950"
              : "bg-slate-100"
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setSide("BUY");
              setError("");
              setMessage("");
            }}
            disabled={submitting}
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
            onClick={() => {
              setSide("SELL");
              setError("");
              setMessage("");
            }}
            disabled={submitting}
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
              value={orderType}
              onChange={(event) =>
                setOrderType(event.target.value)
              }
              disabled={submitting}
              className={`h-9 w-full rounded-lg border px-2 text-xs outline-none ${
                isDark
                  ? "border-slate-700 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-900"
              }`}
            >
              <option value="MARKET">
                MARKET
              </option>

              <option value="LIMIT">
                LIMIT
              </option>
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
              step="1"
              disabled={submitting}
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
              value={
                quoteLoading
                  ? "Loading..."
                  : formattedPrice
              }
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
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {formattedEstimatedValue}
            </span>
          </div>

          {message && (
            <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-500">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-500">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleOrder}
            disabled={
              submitting ||
              quoteLoading ||
              !selectedSymbol ||
              price === null ||
              numericQuantity < 1
            }
            className={`w-full rounded-lg py-2.5 text-xs font-bold text-white ${
              side === "BUY"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-red-500 hover:bg-red-600"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {submitting
              ? "Executing..."
              : `${side} ${selectedSymbol?.symbol || "--"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderTicket;