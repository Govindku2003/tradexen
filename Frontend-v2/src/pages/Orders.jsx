import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Filter,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { getOrders } from "../services/api/orderApi";

const STATUS_OPTIONS = [
  { value: "", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "FILLED", label: "Filled" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "OPEN", label: "Open" },
  { value: "PARTIALLY_FILLED", label: "Partially Filled" },
];

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  return `₹${formatNumber(number)}`;
};

const formatDate = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusClasses = (status, isDark) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "FILLED") {
    return isDark
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-emerald-50 text-emerald-600";
  }

  if (
    normalized === "REJECTED" ||
    normalized === "CANCELLED"
  ) {
    return isDark
      ? "bg-red-500/10 text-red-400"
      : "bg-red-50 text-red-600";
  }

  if (
    normalized === "PENDING" ||
    normalized === "OPEN" ||
    normalized === "PARTIALLY_FILLED"
  ) {
    return isDark
      ? "bg-amber-500/10 text-amber-400"
      : "bg-amber-50 text-amber-600";
  }

  return isDark
    ? "bg-slate-800 text-slate-300"
    : "bg-slate-100 text-slate-600";
};

const getStatusIcon = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "FILLED") {
    return <CheckCircle2 size={14} />;
  }

  if (
    normalized === "REJECTED" ||
    normalized === "CANCELLED"
  ) {
    return <XCircle size={14} />;
  }

  return <Clock3 size={14} />;
};

function Orders() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [orders, setOrders] = useState([]);
  const [tradingAccount, setTradingAccount] = useState(null);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getOrders({
          status,
          limit: 50,
          skip: 0,
        });

        const data = response?.data || {};

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : [],
        );

        setTradingAccount(
          data.tradingAccount || null,
        );
      } catch (err) {
        console.error("Orders API error:", err);

        setOrders([]);
        setTradingAccount(null);

        setError(
          err?.message ||
            "Unable to load order history",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleOrderExecuted = () => {
      fetchOrders({ silent: true });
    };

    window.addEventListener(
      "tradexen:order-executed",
      handleOrderExecuted,
    );

    return () => {
      window.removeEventListener(
        "tradexen:order-executed",
        handleOrderExecuted,
      );
    };
  }, [fetchOrders]);

  const summary = useMemo(() => {
    const total = orders.length;

    const filled = orders.filter(
      (order) =>
        String(order?.status).toUpperCase() ===
        "FILLED",
    ).length;

    const pending = orders.filter((order) =>
      ["PENDING", "OPEN", "PARTIALLY_FILLED"].includes(
        String(order?.status).toUpperCase(),
      ),
    ).length;

    const rejected = orders.filter((order) =>
      ["REJECTED", "CANCELLED"].includes(
        String(order?.status).toUpperCase(),
      ),
    ).length;

    return {
      total,
      filled,
      pending,
      rejected,
    };
  }, [orders]);

  const cardClass = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";

  const mutedText = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const headingText = isDark
    ? "text-white"
    : "text-slate-900";

  return (
    <section
      className={`min-h-[calc(100vh-4rem)] p-4 transition-colors duration-200 sm:p-6 ${
        isDark
          ? "bg-slate-950 text-slate-200"
          : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedText}`}
            >
              Trading
            </p>

            <h1
              className={`mt-1 text-2xl font-bold ${headingText}`}
            >
              Orders
            </h1>

            <p
              className={`mt-1 text-sm ${mutedText}`}
            >
              View and monitor your paper-trading
              orders.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchOrders({ silent: true })
            }
            disabled={loading || refreshing}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "animate-spin" : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* ACCOUNT STRIP */}
        <div
          className={`rounded-xl border p-4 ${cardClass}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className={`text-xs ${mutedText}`}
              >
                Trading Account
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={`text-sm font-bold ${headingText}`}
                >
                  Paper Trading
                </span>

                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-500">
                  Active
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <div>
                <p
                  className={`text-[11px] ${mutedText}`}
                >
                  Available
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${headingText}`}
                >
                  {formatCurrency(
                    tradingAccount?.availableBalance,
                  )}
                </p>
              </div>

              <div>
                <p
                  className={`text-[11px] ${mutedText}`}
                >
                  Invested
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${headingText}`}
                >
                  {formatCurrency(
                    tradingAccount?.investedAmount,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            label="Total Orders"
            value={summary.total}
            icon={<Filter size={17} />}
            isDark={isDark}
          />

          <SummaryCard
            label="Filled"
            value={summary.filled}
            icon={<CheckCircle2 size={17} />}
            isDark={isDark}
          />

          <SummaryCard
            label="Pending"
            value={summary.pending}
            icon={<Clock3 size={17} />}
            isDark={isDark}
          />

          <SummaryCard
            label="Rejected / Cancelled"
            value={summary.rejected}
            icon={<XCircle size={17} />}
            isDark={isDark}
          />
        </div>

        {/* ORDER HISTORY */}
        <div
          className={`overflow-hidden rounded-xl border ${cardClass}`}
        >
          {/* TOOLBAR */}
          <div
            className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <div>
              <h2
                className={`text-sm font-bold ${headingText}`}
              >
                Order History
              </h2>

              <p
                className={`mt-1 text-xs ${mutedText}`}
              >
                Your latest orders from the active
                trading account.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter
                size={15}
                className={mutedText}
              />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className={`h-9 rounded-lg border px-3 text-xs outline-none ${
                  isDark
                    ? "border-slate-700 bg-slate-950 text-slate-200"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="m-4 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold">
                  Unable to load orders
                </p>

                <p className="mt-1 text-xs opacity-80">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div
              className={`flex min-h-[280px] items-center justify-center text-sm ${mutedText}`}
            >
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            /* EMPTY */
            <div
              className={`flex min-h-[280px] flex-col items-center justify-center px-5 text-center ${mutedText}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isDark
                    ? "bg-slate-800"
                    : "bg-slate-100"
                }`}
              >
                <Clock3 size={20} />
              </div>

              <h3
                className={`mt-4 text-sm font-bold ${headingText}`}
              >
                No orders found
              </h3>

              <p className="mt-1 max-w-sm text-xs">
                Your order history will appear here
                after you place a trade.
              </p>
            </div>
          ) : (
            /* DESKTOP TABLE */
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left">
                <thead
                  className={
                    isDark
                      ? "bg-slate-950/70"
                      : "bg-slate-50"
                  }
                >
                  <tr
                    className={`text-[10px] font-bold uppercase tracking-wide ${mutedText}`}
                  >
                    <th className="px-4 py-3">
                      Symbol
                    </th>

                    <th className="px-4 py-3">
                      Side
                    </th>

                    <th className="px-4 py-3">
                      Type
                    </th>

                    <th className="px-4 py-3">
                      Qty
                    </th>

                    <th className="px-4 py-3">
                      Requested
                    </th>

                    <th className="px-4 py-3">
                      Executed
                    </th>

                    <th className="px-4 py-3">
                      Value
                    </th>

                    <th className="px-4 py-3">
                      Source
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const side = String(
                      order?.side || "",
                    ).toUpperCase();

                    const statusValue = String(
                      order?.status || "",
                    ).toUpperCase();

                    const quantity =
                      Number(order?.quantity) || 0;

                    const requestedPrice =
                      Number(
                        order?.requestedPrice,
                      );

                    const executedPrice =
                      Number(
                        order?.executedPrice,
                      );

                    const displayPrice =
                      Number.isFinite(
                        executedPrice,
                      ) && executedPrice > 0
                        ? executedPrice
                        : requestedPrice;

                    const value =
                      Number.isFinite(
                        displayPrice,
                      ) && displayPrice > 0
                        ? displayPrice * quantity
                        : null;

                    return (
                      <tr
                        key={
                          order?._id ||
                          order?.id
                        }
                        className={`border-t text-xs ${
                          isDark
                            ? "border-slate-800"
                            : "border-slate-100"
                        }`}
                      >
                        <td
                          className={`px-4 py-3 font-bold ${headingText}`}
                        >
                          {order?.symbol ||
                            "--"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${
                              side === "BUY"
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            {side || "--"}
                          </span>
                        </td>

                        <td
                          className={`px-4 py-3 ${mutedText}`}
                        >
                          {order?.orderType ||
                            "--"}
                        </td>

                        <td className="px-4 py-3 font-semibold">
                          {quantity}
                        </td>

                        <td className="px-4 py-3">
                          {formatCurrency(
                            requestedPrice,
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {Number.isFinite(
                            executedPrice,
                          ) &&
                          executedPrice > 0
                            ? formatCurrency(
                                executedPrice,
                              )
                            : "--"}
                        </td>

                        <td className="px-4 py-3">
                          {formatCurrency(value)}
                        </td>

                        <td
                          className={`px-4 py-3 ${mutedText}`}
                        >
                          {order?.source ||
                            "MANUAL"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusClasses(
                              statusValue,
                              isDark,
                            )}`}
                          >
                            {getStatusIcon(
                              statusValue,
                            )}

                            {statusValue ||
                              "--"}
                          </span>
                        </td>

                        <td
                          className={`whitespace-nowrap px-4 py-3 ${mutedText}`}
                        >
                          {formatDate(
                            order?.executedAt ||
                              order?.createdAt,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  isDark,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          {label}
        </span>

        <span
          className={
            isDark
              ? "text-cyan-400"
              : "text-cyan-600"
          }
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-2 text-xl font-bold ${
          isDark
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default Orders;