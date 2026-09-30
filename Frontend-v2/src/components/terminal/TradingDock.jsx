import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getPositions } from "../../services/api/positionApi";

function TradingDock() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tab, setTab] = useState("positions");

  const [positions, setPositions] = useState([]);
  const [tradingAccount, setTradingAccount] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchPositions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPositions();

        if (!mounted) {
          return;
        }

        /*
          Backend response:

          response.data = {
            positions: [],
            pagination: {},
            tradingAccount: {}
          }
        */

        const positionData = response?.data?.positions || [];
        const accountData =
          response?.data?.tradingAccount || null;

        setPositions(
          Array.isArray(positionData)
            ? positionData
            : [],
        );

        setTradingAccount(accountData);
      } catch (err) {
        console.error(
          "Positions API error:",
          err,
        );

        if (mounted) {
          setPositions([]);
          setTradingAccount(null);

          setError(
            err.message ||
              "Unable to load positions",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPositions();

    return () => {
      mounted = false;
    };
  }, []);

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
      value === undefined
    ) {
      return "--";
    }

    return `₹${formatNumber(value)}`;
  };

  const getSymbol = (position) =>
    position?.symbol ||
    position?.tradingSymbol ||
    position?.instrument ||
    "--";

  const getQuantity = (position) =>
    position?.quantity ??
    position?.qty ??
    position?.netQuantity ??
    0;

  const getAveragePrice = (position) =>
    position?.averagePrice ??
    position?.avgPrice ??
    position?.avg ??
    null;

  const getLtp = (position) =>
    position?.lastPrice ??
    position?.ltp ??
    position?.currentPrice ??
    null;

  const getPnl = (position) =>
    position?.pnl ??
    position?.profitLoss ??
    position?.unrealizedPnl ??
    0;

  return (
    <div
      className={`mt-3 rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Trading Account Summary */}
      {tradingAccount && (
        <div
          className={`border-b px-4 py-4 ${
            isDark
              ? "border-slate-800"
              : "border-slate-200"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
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
                  {tradingAccount.status || "ACTIVE"}
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
                  tradingAccount.initialBalance,
                )}
              </p>
            </div>

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
                title={tradingAccount.id}
              >
                {tradingAccount.id || "--"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className={`flex items-center gap-5 border-b px-4 ${
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

      {/* Positions */}
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
            <table className="w-full min-w-[650px] text-left">
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

                        <td className="px-4 py-3">
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
                            : ""}
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

      {/* Orders */}
      {tab === "orders" && (
        <div
          className={`flex h-28 items-center justify-center text-xs ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        >
          Orders will appear here
        </div>
      )}

      {/* Trades */}
      {tab === "trades" && (
        <div
          className={`flex h-28 items-center justify-center text-xs ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        >
          Executed trades will appear here
        </div>
      )}
    </div>
  );
}

export default TradingDock; 