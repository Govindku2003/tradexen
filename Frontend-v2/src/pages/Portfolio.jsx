import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { getPortfolio } from "../services/api/portfolioApi";

const formatINR = (value, decimals = 2) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0.00";
  }

  return number.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN");
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPnLClass = (value, isDark) => {
  const number = Number(value);

  if (number > 0) {
    return "text-emerald-500";
  }

  if (number < 0) {
    return "text-red-500";
  }

  return isDark ? "text-slate-200" : "text-slate-900";
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  pnl = false,
  isDark,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 transition-colors ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-2 text-xl font-bold sm:text-2xl ${
              pnl ? getPnLClass(value, isDark) : ""
            }`}
          >
            {value}
          </p>

          {subtitle && (
            <p
              className={`mt-1 text-xs ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`rounded-xl p-2.5 ${
            isDark
              ? "bg-slate-800 text-cyan-400"
              : "bg-cyan-50 text-cyan-600"
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, subtitle, children, isDark, action }) => {
  return (
    <section
      className={`rounded-2xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>

          {subtitle && (
            <p
              className={`mt-1 text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
};

const Portfolio = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPortfolio = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getPortfolio();

      setData(response?.data || null);
    } catch (err) {
      console.error("Portfolio fetch error:", err);

      setError(
        err?.message || "Unable to load portfolio information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  useEffect(() => {
    const handleOrderExecuted = () => {
      fetchPortfolio(true);
    };

    window.addEventListener(
      "tradexen:order-executed",
      handleOrderExecuted
    );

    return () => {
      window.removeEventListener(
        "tradexen:order-executed",
        handleOrderExecuted
      );
    };
  }, [fetchPortfolio]);

  const user = data?.user || {};
  const tradingAccount = data?.tradingAccount || {};
  const portfolio = data?.portfolio || {};
  const holdings = data?.holdings || [];
  const activity = data?.activity || {};

  const totalPnL = Number(portfolio.totalPnL || 0);
  const todayPnL = Number(portfolio.todayPnL || 0);

  const pnlPositive = totalPnL >= 0;
  const todayPositive = todayPnL >= 0;

  const accountInitials = useMemo(() => {
    const name = user?.name || "User";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [user?.name]);

  if (loading) {
    return (
      <main
        className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${
          isDark
            ? "bg-slate-950 text-slate-200"
            : "bg-[#f5f7fa] text-slate-900"
        }`}
      >
        <div className="mx-auto max-w-[1500px] animate-pulse space-y-5">
          <div className="h-8 w-48 rounded bg-slate-800/60" />

          <div className="h-36 rounded-2xl bg-slate-800/40" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-slate-800/40"
              />
            ))}
          </div>

          <div className="h-72 rounded-2xl bg-slate-800/40" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 ${
          isDark
            ? "bg-slate-950 text-slate-200"
            : "bg-[#f5f7fa] text-slate-900"
        }`}
      >
        <div className="mx-auto max-w-[900px] pt-10">
          <div
            className={`rounded-2xl border p-6 text-center ${
              isDark
                ? "border-red-900/60 bg-slate-900"
                : "border-red-200 bg-white"
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Activity size={22} />
            </div>

            <h1 className="mt-4 text-xl font-bold">
              Unable to load portfolio
            </h1>

            <p
              className={`mt-2 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchPortfolio()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-[calc(100vh-4rem)] p-4 transition-colors sm:p-6 lg:p-8 ${
        isDark
          ? "bg-slate-950 text-slate-200"
          : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-[1500px] space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                isDark ? "text-cyan-400" : "text-cyan-600"
              }`}
            >
              Account
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Portfolio
            </h1>

            <p
              className={`mt-1 text-sm ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Your trading account, holdings and performance overview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchPortfolio(true)}
            disabled={refreshing}
            className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              isDark
                ? "border-slate-700 bg-slate-900 hover:bg-slate-800"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Account profile */}
        <section
          className={`overflow-hidden rounded-2xl border ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`border-b px-5 py-4 ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <p
              className={`text-xs font-medium uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Your Account
            </p>
          </div>

          <div className="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-lg font-bold text-cyan-500">
                {accountInitials || <User size={22} />}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">
                  {user.name || "TradeXen User"}
                </h2>

                <div
                  className={`mt-1 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:gap-4 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {user.email || "Email not available"}
                  </span>

                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
                <CheckCircle2 size={14} />
                {user.isActive === false ? "Inactive" : "Active"}
              </span>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  isDark
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Paper Trading Account
              </span>
            </div>
          </div>
        </section>

        {/* Overview */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Value"
            value={formatINR(portfolio.totalValue)}
            subtitle="Portfolio value"
            icon={Wallet}
            isDark={isDark}
          />

          <StatCard
            title="Available Balance"
            value={formatINR(portfolio.cashBalance)}
            subtitle="Available for trading"
            icon={BriefcaseBusiness}
            isDark={isDark}
          />

          <StatCard
            title="Invested"
            value={formatINR(portfolio.investedValue)}
            subtitle={`${portfolio.positionCount || 0} open position(s)`}
            icon={BarChart3}
            isDark={isDark}
          />

          <StatCard
            title="Total P&L"
            value={`${pnlPositive ? "+" : ""}${formatINR(totalPnL)}`}
            subtitle={`${Number(
              portfolio.totalPnLPercent || 0
            ).toFixed(2)}% overall`}
            icon={pnlPositive ? TrendingUp : TrendingDown}
            pnl
            isDark={isDark}
          />
        </div>

        {/* P&L summary */}
        <div className="grid gap-5 lg:grid-cols-3">
          <SectionCard
            title="Performance"
            subtitle="Current portfolio performance"
            isDark={isDark}
          >
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1">
              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Realized P&L
                </p>

                <p
                  className={`mt-2 text-xl font-bold ${getPnLClass(
                    portfolio.realizedPnL,
                    isDark
                  )}`}
                >
                  {Number(portfolio.realizedPnL || 0) >= 0
                    ? "+"
                    : ""}
                  {formatINR(portfolio.realizedPnL)}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Unrealized P&L
                </p>

                <p
                  className={`mt-2 text-xl font-bold ${getPnLClass(
                    portfolio.unrealizedPnL,
                    isDark
                  )}`}
                >
                  {Number(portfolio.unrealizedPnL || 0) >= 0
                    ? "+"
                    : ""}
                  {formatINR(portfolio.unrealizedPnL)}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xs ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Today's P&L
                    </p>

                    <p
                      className={`mt-2 text-xl font-bold ${getPnLClass(
                        todayPnL,
                        isDark
                      )}`}
                    >
                      {todayPositive ? "+" : ""}
                      {formatINR(todayPnL)}
                    </p>
                  </div>

                  {todayPositive ? (
                    <ArrowUpRight className="text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Account details */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Account Details"
              subtitle="Your TradeXen trading account information"
              isDark={isDark}
            >
              <div className="grid gap-px bg-slate-800/50 sm:grid-cols-2">
                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Name
                  </p>

                  <p className="mt-1 font-semibold">
                    {user.name || "—"}
                  </p>
                </div>

                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Email
                  </p>

                  <p className="mt-1 break-all font-semibold">
                    {user.email || "—"}
                  </p>
                </div>

                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Mobile
                  </p>

                  <p className="mt-1 font-semibold">
                    {user.phone || "—"}
                  </p>
                </div>

                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Joined
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatDate(user.createdAt)}
                  </p>
                </div>

                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Account Type
                  </p>

                  <p className="mt-1 font-semibold uppercase">
                    {tradingAccount.accountType || "PAPER"}
                  </p>
                </div>

                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Currency
                  </p>

                  <p className="mt-1 font-semibold">
                    {tradingAccount.currency || "INR"}
                  </p>
                </div>

                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Initial Balance
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatINR(tradingAccount.initialBalance)}
                  </p>
                </div>

                <div
                  className={`p-5 ${
                    isDark ? "bg-slate-900" : "bg-white"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Status
                  </p>

                  <p className="mt-1 font-semibold text-emerald-500">
                    {tradingAccount.status || "ACTIVE"}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Holdings */}
        <SectionCard
          title="Holdings"
          subtitle="Your current open positions"
          isDark={isDark}
          action={
            <span
              className={`text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {holdings.length} holding(s)
            </span>
          }
        >
          {holdings.length === 0 ? (
            <div className="p-10 text-center">
              <BriefcaseBusiness
                size={32}
                className={`mx-auto ${
                  isDark ? "text-slate-600" : "text-slate-300"
                }`}
              />

              <p className="mt-3 font-semibold">
                No open holdings
              </p>

              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Your active positions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead
                  className={
                    isDark
                      ? "bg-slate-950/70"
                      : "bg-slate-50"
                  }
                >
                  <tr>
                    {[
                      "Symbol",
                      "Side",
                      "Qty",
                      "Avg Price",
                      "LTP",
                      "Market Value",
                      "P&L",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {holdings.map((holding, index) => {
                    const holdingPnL = Number(
                      holding.unrealizedPnL ??
                        holding.pnl ??
                        0
                    );

                    const marketValue = Number(
                      holding.marketValue ??
                        holding.currentValue ??
                        Number(holding.currentPrice || 0) *
                          Number(holding.quantity || 0)
                    );

                    return (
                      <tr
                        key={
                          holding._id ||
                          holding.id ||
                          `${holding.symbol}-${index}`
                        }
                        className={`border-t ${
                          isDark
                            ? "border-slate-800"
                            : "border-slate-200"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold">
                            {holding.symbol || "—"}
                          </div>

                          <div
                            className={`mt-0.5 text-xs ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {holding.exchange || "NSE"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              holding.side === "SHORT"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-emerald-500/10 text-emerald-500"
                            }`}
                          >
                            {holding.side || "LONG"}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatNumber(holding.quantity)}
                        </td>

                        <td className="px-5 py-4">
                          {formatINR(
                            holding.averageEntryPrice ??
                              holding.averagePrice
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {formatINR(
                            holding.currentPrice ??
                              holding.ltp
                          )}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatINR(marketValue)}
                        </td>

                        <td
                          className={`px-5 py-4 font-bold ${getPnLClass(
                            holdingPnL,
                            isDark
                          )}`}
                        >
                          {holdingPnL >= 0 ? "+" : ""}
                          {formatINR(holdingPnL)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Activity overview */}
        <div className="grid gap-5 lg:grid-cols-2">
          <SectionCard
            title="Trading Activity"
            subtitle="Account activity summary"
            isDark={isDark}
          >
            <div className="grid grid-cols-2 gap-4 p-5">
              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Total Orders
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(activity.totalOrders)}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Total Trades
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(activity.totalTrades)}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Open Positions
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNumber(activity.openPositions)}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  isDark
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Last Updated
                </p>

                <p className="mt-2 text-sm font-bold">
                  {formatDateTime(portfolio.lastUpdated)}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Recent orders */}
          <SectionCard
            title="Recent Orders"
            subtitle="Latest trading activity"
            isDark={isDark}
          >
            <div className="divide-y divide-slate-800">
              {activity.recentOrders?.length ? (
                activity.recentOrders
                  .slice(0, 5)
                  .map((order, index) => (
                    <div
                      key={
                        order._id ||
                        order.id ||
                        `${order.symbol}-${index}`
                      }
                      className="flex items-center justify-between gap-3 p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`rounded-lg p-2 ${
                            order.side === "SELL"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {order.side === "SELL" ? (
                            <ArrowDownRight size={17} />
                          ) : (
                            <ArrowUpRight size={17} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {order.symbol}
                          </p>

                          <p
                            className={`mt-0.5 text-xs ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
                            {order.side} · Qty {order.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-xs font-semibold ${
                            order.status === "FILLED"
                              ? "text-emerald-500"
                              : order.status === "REJECTED"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}
                        >
                          {order.status}
                        </span>

                        <p
                          className={`mt-1 text-[11px] ${
                            isDark
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-8 text-center">
                  <Clock3
                    size={28}
                    className={`mx-auto ${
                      isDark
                        ? "text-slate-600"
                        : "text-slate-300"
                    }`}
                  />

                  <p className="mt-2 text-sm font-semibold">
                    No recent orders
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Recent trades */}
        <SectionCard
          title="Recent Trades"
          subtitle="Latest executed trades"
          isDark={isDark}
        >
          {activity.recentTrades?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead
                  className={
                    isDark
                      ? "bg-slate-950/70"
                      : "bg-slate-50"
                  }
                >
                  <tr>
                    {[
                      "Symbol",
                      "Side",
                      "Qty",
                      "Execution",
                      "Value",
                      "Realized P&L",
                      "Time",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {activity.recentTrades
                    .slice(0, 10)
                    .map((trade, index) => {
                      const tradePnL = Number(
                        trade.realizedPnL || 0
                      );

                      return (
                        <tr
                          key={
                            trade._id ||
                            trade.id ||
                            `${trade.symbol}-${index}`
                          }
                          className={`border-t ${
                            isDark
                              ? "border-slate-800"
                              : "border-slate-200"
                          }`}
                        >
                          <td className="px-5 py-4 font-bold">
                            {trade.symbol}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={
                                trade.side === "SELL"
                                  ? "text-red-500"
                                  : "text-emerald-500"
                              }
                            >
                              {trade.side}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {formatNumber(trade.quantity)}
                          </td>

                          <td className="px-5 py-4">
                            {formatINR(
                              trade.executedPrice
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {formatINR(trade.totalValue)}
                          </td>

                          <td
                            className={`px-5 py-4 font-semibold ${getPnLClass(
                              tradePnL,
                              isDark
                            )}`}
                          >
                            {tradePnL >= 0 ? "+" : ""}
                            {formatINR(tradePnL)}
                          </td>

                          <td
                            className={`px-5 py-4 text-sm ${
                              isDark
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {formatDateTime(trade.executedAt)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <Activity
                size={30}
                className={`mx-auto ${
                  isDark
                    ? "text-slate-600"
                    : "text-slate-300"
                }`}
              />

              <p className="mt-3 font-semibold">
                No executed trades yet
              </p>

              <p
                className={`mt-1 text-sm ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Your completed paper trades will appear here.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </main>
  );
};

export default Portfolio;