import { Plus, Search, Star } from "lucide-react";
import { useState } from "react";

import { useTheme } from "../../context/ThemeContext";
import { useTerminal } from "../../context/TerminalContext";

const calculateChangePercent = (price, change) => {
  if (
    price === null ||
    price === undefined ||
    change === null ||
    change === undefined
  ) {
    return null;
  }

  const previousPrice = price - change;

  if (!previousPrice) {
    return null;
  }

  return (change / previousPrice) * 100;
};

const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return "--";
  }

  return Number(price).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatChangePercent = (price, change) => {
  const percent = calculateChangePercent(
    price,
    change,
  );

  if (percent === null) {
    return "--";
  }

  return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
};

function Watchlist() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    symbols,
    selectedSymbol,
    selectedQuote,
    selectSymbol,
    quoteLoading,
    watchlistQuotes,
    watchlistLoading,
  } = useTerminal();

  const [search, setSearch] = useState("");

  const filteredSymbols = symbols.filter((item) => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return true;
    }

    return (
      item.symbol.toLowerCase().includes(value) ||
      item.name.toLowerCase().includes(value)
    );
  });

  return (
    <div
      className={`h-full overflow-hidden rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* HEADER */}
      <div
        className={`flex items-center justify-between border-b px-3 py-3 ${
          isDark
            ? "border-slate-800"
            : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <Star
            size={15}
            className="text-cyan-500"
          />

          <h2
            className={`text-xs font-bold ${
              isDark
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Watchlist
          </h2>

          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        <button
          type="button"
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* SEARCH */}
      <div
        className={`border-b px-3 py-2 ${
          isDark
            ? "border-slate-800"
            : "border-slate-100"
        }`}
      >
        <div
          className={`flex items-center gap-2 rounded-lg border px-2 ${
            isDark
              ? "border-slate-700 bg-slate-950"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <Search
            size={14}
            className={
              isDark
                ? "text-slate-500"
                : "text-slate-400"
            }
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search symbol"
            className={`h-8 w-full bg-transparent text-xs outline-none ${
              isDark
                ? "text-white placeholder:text-slate-500"
                : "text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
      </div>

      {/* WATCHLIST */}
      <div>
        {filteredSymbols.map((item) => {
          /*
            Every symbol now gets its own quote
            from TerminalContext.

            Example:

            watchlistQuotes = {
              RELIANCE: {...},
              TCS: {...},
              INFY: {...}
            }
          */
          const watchlistQuote =
            watchlistQuotes?.[item.symbol] ?? null;

          /*
            For the selected symbol, prefer selectedQuote
            because it is the quote currently displayed
            by ChartPanel and OrderTicket.
          */
          const quote =
            selectedSymbol?.symbol === item.symbol
              ? selectedQuote || watchlistQuote
              : watchlistQuote;

          const price = quote?.price ?? null;
          const change = quote?.change ?? null;

          const isSelected =
            selectedSymbol?.symbol === item.symbol;

          const isPositive =
            change !== null &&
            change !== undefined
              ? change >= 0
              : true;

          const isLoading =
            watchlistLoading &&
            !watchlistQuote;

          return (
            <button
              type="button"
              key={item.symbol}
              onClick={() => selectSymbol(item)}
              className={`flex w-full items-center justify-between border-b px-3 py-3 text-left ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-100"
              } ${
                isSelected
                  ? isDark
                    ? "bg-cyan-400/5"
                    : "bg-cyan-50/70"
                  : ""
              }`}
            >
              {/* SYMBOL INFO */}
              <div>
                <div
                  className={`text-xs font-bold ${
                    isSelected
                      ? "text-cyan-500"
                      : isDark
                        ? "text-slate-200"
                        : "text-slate-800"
                  }`}
                >
                  {item.symbol}
                </div>

                <div
                  className={`mt-0.5 text-[10px] ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
                  {item.name}
                </div>
              </div>

              {/* QUOTE */}
              <div className="text-right">
                {isLoading ||
                (isSelected && quoteLoading) ? (
                  <span className="text-[10px] text-slate-400">
                    Loading...
                  </span>
                ) : (
                  <>
                    <div
                      className={`text-xs font-semibold ${
                        isDark
                          ? "text-slate-200"
                          : "text-slate-800"
                      }`}
                    >
                      {formatPrice(price)}
                    </div>

                    <div
                      className={`mt-0.5 text-[10px] font-semibold ${
                        isPositive
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatChangePercent(
                        price,
                        change,
                      )}
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Watchlist;