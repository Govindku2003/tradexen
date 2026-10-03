import { useCallback, useEffect, useState } from "react";

import { useTheme } from "../../context/ThemeContext";

import { getPositions } from "../../services/api/positionApi";
import { getOrders } from "../../services/api/orderApi";
import { getTrades } from "../../services/api/tradeApi";


function TradingDock() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tab, setTab] = useState("positions");

  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tradingAccount, setTradingAccount] = useState(null);
  const [trades, setTrades] = useState([]);
const [tradesLoading, setTradesLoading] = useState(false);
const [tradesError, setTradesError] = useState("");

  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [error, setError] = useState("");
  const [ordersError, setOrdersError] = useState("");

  // --------------------------------------------------
  // FORMATTERS
  // --------------------------------------------------

  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "--";
    }

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
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "--";
    }

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --------------------------------------------------
  // POSITION FIELD MAPPERS
  // IMPORTANT:
  // Backend Position model uses:
  // averageEntryPrice
  // currentPrice
  // unrealizedPnL
  // --------------------------------------------------

  const getSymbol = (position) =>
    position?.symbol ||
    position?.tradingSymbol ||
    position?.instrument ||
    "--";

  const getQuantity = (position) =>
    Number(
      position?.quantity ??
        position?.qty ??
        position?.netQuantity ??
        0,
    );

  const getAveragePrice = (position) =>
    position?.averageEntryPrice ??
    position?.averagePrice ??
    position?.avgPrice ??
    position?.avg ??
    null;

  const getLtp = (position) =>
    position?.currentPrice ??
    position?.lastPrice ??
    position?.ltp ??
    null;

  const getPnl = (position) =>
    position?.unrealizedPnL ??
    position?.unrealizedPnl ??
    position?.pnl ??
    position?.profitLoss ??
    0;

  // --------------------------------------------------
  // FETCH POSITIONS
  // --------------------------------------------------

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPositions();

      const positionData = response?.data?.positions || [];
      const accountData =
        response?.data?.tradingAccount || null;

      // Frontend safety filter
      const openPositions = Array.isArray(positionData)
        ? positionData.filter(
            (position) =>
              Number(position?.quantity || 0) > 0 &&
              position?.status !== "CLOSED",
          )
        : [];

      setPositions(openPositions);
      setTradingAccount(accountData);
    } catch (err) {
      console.error("Positions API error:", err);

      setPositions([]);
      setTradingAccount(null);

      setError(
        err?.message ||
          "Unable to load positions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // FETCH ORDERS
  // --------------------------------------------------

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await getOrders({
        limit: 20,
        skip: 0,
      });

      const orderData =
        response?.data?.orders ||
        response?.data ||
        [];

      setOrders(
        Array.isArray(orderData)
          ? orderData
          : [],
      );
    } catch (err) {
      console.error("Orders API error:", err);

      setOrders([]);

      setOrdersError(
        err?.message ||
          "Unable to load orders",
      );
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // --------------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchPositions();
    fetchOrders();
  }, [fetchPositions, fetchOrders]);

  // --------------------------------------------------
  // REFRESH AFTER ORDER EXECUTION
  // --------------------------------------------------

  useEffect(() => {
    const handleOrderExecuted = () => {
      fetchPositions();
      fetchOrders();
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
  }, [fetchPositions, fetchOrders]);

  useEffect(() => {
  let mounted = true;

  const fetchTrades = async () => {
    try {
      setTradesLoading(true);
      setTradesError("");

      const response = await getTrades({
        limit: 50,
        skip: 0,
      });

      if (!mounted) {
        return;
      }

      const tradeData = response?.data?.trades || [];

      setTrades(
        Array.isArray(tradeData)
          ? tradeData
          : [],
      );
    } catch (err) {
      console.error("Trades API error:", err);

      if (mounted) {
        setTrades([]);
        setTradesError(
          err.message || "Unable to load trades",
        );
      }
    } finally {
      if (mounted) {
        setTradesLoading(false);
      }
    }
  };

  fetchTrades();

  const interval = setInterval(fetchTrades, 5000);

  const handleOrderExecuted = () => {
    fetchTrades();
  };

  window.addEventListener(
    "tradexen:order-executed",
    handleOrderExecuted,
  );

  return () => {
    mounted = false;
    clearInterval(interval);

    window.removeEventListener(
      "tradexen:order-executed",
      handleOrderExecuted,
    );
  };
}, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div
      className={`mt-3 overflow-hidden rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* ============================================
          TRADING ACCOUNT
      ============================================ */}

      {tradingAccount && (
        <div
          className={`border-b px-4 py-4 ${
            isDark
              ? "border-slate-800"
              : "border-slate-200"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Trading Account
              </p>

              <div className="mt-1 flex items-center gap-2">
                <h3
                  className={`text-sm font-bold ${
                    isDark
                      ? "text-slate-100"
                      : "text-slate-900"
                  }`}
                >
                  Paper Account
                </h3>

                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-500">
                  {String(
                    tradingAccount.status ||
                      "ACTIVE",
                  ).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p
                className={`text-[9px] uppercase ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Currency
              </p>

              <p
                className={`text-xs font-semibold ${
                  isDark
                    ? "text-slate-300"
                    : "text-slate-700"
                }`}
              >
                {tradingAccount.currency || "INR"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {/* AVAILABLE */}

            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p
                className={`text-[9px] uppercase ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Available
              </p>

              <p
                className={`mt-1 text-xs font-bold ${
                  isDark
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
                {formatCurrency(
                  tradingAccount.availableBalance,
                )}
              </p>
            </div>

            {/* INVESTED */}

            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p
                className={`text-[9px] uppercase ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Invested
              </p>

              <p
                className={`mt-1 text-xs font-bold ${
                  isDark
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
                {formatCurrency(
                  tradingAccount.investedAmount,
                )}
              </p>
            </div>

            {/* INITIAL BALANCE */}

            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p
                className={`text-[9px] uppercase ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Initial Balance
              </p>

              <p
                className={`mt-1 text-xs font-bold ${
                  isDark
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
                {formatCurrency(
                  tradingAccount.initialBalance ??
                    tradingAccount.startingBalance ??
                    tradingAccount.balance,
                )}
              </p>
            </div>

            {/* ACCOUNT ID */}

            <div
              className={`rounded-lg border px-3 py-2 ${
                isDark
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <p
                className={`text-[9px] uppercase ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Account ID
              </p>

              <p
                className={`mt-1 truncate text-[10px] font-semibold ${
                  isDark
                    ? "text-slate-300"
                    : "text-slate-700"
                }`}
                title={
                  tradingAccount.id ||
                  tradingAccount._id ||
                  ""
                }
              >
                {tradingAccount.id ||
                  tradingAccount._id ||
                  "--"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          TABS
      ============================================ */}

      <div
        className={`flex items-center gap-5 overflow-x-auto border-b px-4 ${
          isDark
            ? "border-slate-800"
            : "border-slate-200"
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
            className={`shrink-0 border-b-2 py-3 text-xs font-semibold ${
              tab === value
                ? "border-cyan-500 text-cyan-500"
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

      {/* ============================================
          POSITIONS
      ============================================ */}

      {tab === "positions" && (
        <div className="overflow-x-auto">
          {loading ? (
            <div
              className={`flex h-28 items-center justify-center text-xs ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Loading positions...
            </div>
          ) : error ? (
            <div className="flex h-28 items-center justify-center px-4 text-xs text-red-500">
              {error}
            </div>
          ) : positions.length === 0 ? (
            <div
              className={`flex h-28 items-center justify-center text-xs ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              No open positions
            </div>
          ) : (
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr
                  className={`text-[10px] ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  <th className="px-4 py-3">
                    SYMBOL
                  </th>

                  <th className="px-4 py-3">
                    QTY
                  </th>

                  <th className="px-4 py-3">
                    AVG
                  </th>

                  <th className="px-4 py-3">
                    LTP
                  </th>

                  <th className="px-4 py-3">
                    P&L
                  </th>
                </tr>
              </thead>

              <tbody>
                {positions.map(
                  (position, index) => {
                    const symbol =
                      getSymbol(position);

                    const quantity =
                      getQuantity(position);

                    const averagePrice =
                      getAveragePrice(
                        position,
                      );

                    const ltp =
                      getLtp(position);

                    const pnl =
                      Number(
                        getPnl(position),
                      ) || 0;

                    return (
                      <tr
                        key={
                          position?._id ||
                          position?.id ||
                          `${symbol}-${index}`
                        }
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
                          {symbol}
                        </td>

                        <td className="px-4 py-3">
                          {quantity}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {averagePrice !== null
                            ? `₹${formatNumber(
                                averagePrice,
                              )}`
                            : "--"}
                        </td>

                        <td className="px-4 py-3">
                          {ltp !== null
                            ? `₹${formatNumber(
                                ltp,
                              )}`
                            : "--"}
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${
                            pnl >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {pnl >= 0
                            ? "+"
                            : "-"}
                          ₹
                          {formatNumber(
                            Math.abs(pnl),
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ============================================
          ORDERS
      ============================================ */}

      {tab === "orders" && (
        <div className="overflow-x-auto">
          {ordersLoading ? (
            <div
              className={`flex h-28 items-center justify-center text-xs ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Loading orders...
            </div>
          ) : ordersError ? (
            <div className="flex h-28 items-center justify-center px-4 text-xs text-red-500">
              {ordersError}
            </div>
          ) : orders.length === 0 ? (
            <div
              className={`flex h-28 items-center justify-center text-xs ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              No orders found
            </div>
          ) : (
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr
                  className={`text-[10px] ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  <th className="px-4 py-3">
                    SYMBOL
                  </th>

                  <th className="px-4 py-3">
                    SIDE
                  </th>

                  <th className="px-4 py-3">
                    QTY
                  </th>

                  <th className="px-4 py-3">
                    PRICE
                  </th>

                  <th className="px-4 py-3">
                    STATUS
                  </th>

                  <th className="px-4 py-3">
                    TIME
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map(
                  (order, index) => {
                    const side =
                      String(
                        order?.side || "",
                      ).toUpperCase();

                    const status =
                      String(
                        order?.status || "",
                      ).toUpperCase();

                    return (
                      <tr
                        key={
                          order?._id ||
                          order?.id ||
                          index
                        }
                        className={`border-t text-xs ${
                          isDark
                            ? "border-slate-800"
                            : "border-slate-100"
                        }`}
                      >
                        <td
                          className={`px-4 py-3 font-semibold ${
                            isDark
                              ? "text-slate-200"
                              : "text-slate-800"
                          }`}
                        >
                          {order?.symbol ||
                            "--"}
                        </td>

                        <td
                          className={`px-4 py-3 font-semibold ${
                            side === "BUY"
                              ? "text-emerald-500"
                              : side === "SELL"
                                ? "text-red-500"
                                : ""
                          }`}
                        >
                          {side || "--"}
                        </td>

                        <td className="px-4 py-3">
                          {order?.quantity ??
                            "--"}
                        </td>

                        <td className="px-4 py-3">
                          {order?.executedPrice ??
                          order?.requestedPrice
                            ? `₹${formatNumber(
                                order?.executedPrice ??
                                  order?.requestedPrice,
                              )}`
                            : "--"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-semibold ${
                              status === "FILLED"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : status ===
                                    "REJECTED"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-slate-500/10 text-slate-400"
                            }`}
                          >
                            {status || "--"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-400">
                          {formatDate(
                            order?.executedAt ||
                              order?.createdAt,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ============================================
          TRADES
      ============================================ */}

     {tab === "trades" && (
  <div className="overflow-x-auto">
    {tradesLoading ? (
      <div
        className={`flex h-32 items-center justify-center text-xs ${
          isDark
            ? "text-slate-500"
            : "text-slate-400"
        }`}
      >
        Loading trades...
      </div>
    ) : tradesError ? (
      <div className="flex h-32 items-center justify-center px-4 text-xs text-red-500">
        {tradesError}
      </div>
    ) : trades.length === 0 ? (
      <div
        className={`flex h-32 items-center justify-center text-xs ${
          isDark
            ? "text-slate-500"
            : "text-slate-400"
        }`}
      >
        No executed trades yet
      </div>
    ) : (
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr
            className={`text-[10px] ${
              isDark
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            <th className="px-4 py-3">
              TIME
            </th>

            <th className="px-4 py-3">
              SYMBOL
            </th>

            <th className="px-4 py-3">
              SIDE
            </th>

            <th className="px-4 py-3">
              QTY
            </th>

            <th className="px-4 py-3">
              PRICE
            </th>

            <th className="px-4 py-3">
              VALUE
            </th>

            <th className="px-4 py-3">
              P&L
            </th>

            <th className="px-4 py-3">
              SOURCE
            </th>
          </tr>
        </thead>

        <tbody>
          {trades.map((trade, index) => {
            const pnl =
              Number(trade?.realizedPnL) || 0;

            const price =
              Number(trade?.executedPrice) || 0;

            const quantity =
              Number(trade?.quantity) || 0;

            const totalValue =
              Number(trade?.totalValue) ||
              price * quantity;

            const executedAt =
              trade?.executedAt ||
              trade?.createdAt;

            return (
              <tr
                key={
                  trade?._id ||
                  trade?.id ||
                  `trade-${index}`
                }
                className={`border-t text-xs ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
                {/* TIME */}
                <td
                  className={`whitespace-nowrap px-4 py-3 ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {executedAt
                    ? new Date(
                        executedAt,
                      ).toLocaleString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "--"}
                </td>

                {/* SYMBOL */}
                <td
                  className={`px-4 py-3 font-bold ${
                    isDark
                      ? "text-slate-200"
                      : "text-slate-800"
                  }`}
                >
                  {trade?.symbol || "--"}
                </td>

                {/* SIDE */}
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-bold ${
                      trade?.side === "BUY"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {trade?.side || "--"}
                  </span>
                </td>

                {/* QTY */}
                <td className="px-4 py-3">
                  {quantity}
                </td>

                {/* PRICE */}
                <td className="px-4 py-3">
                  ₹{formatNumber(price)}
                </td>

                {/* VALUE */}
                <td className="px-4 py-3">
                  ₹{formatNumber(totalValue)}
                </td>

                {/* P&L */}
                <td
                  className={`px-4 py-3 font-semibold ${
                    pnl >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {pnl >= 0 ? "+" : "-"}₹
                  {formatNumber(
                    Math.abs(pnl),
                  )}
                </td>

                {/* SOURCE */}
                <td
                  className={`px-4 py-3 ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {trade?.source || "MANUAL"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>
)}
    </div>
  );
}

export default TradingDock;