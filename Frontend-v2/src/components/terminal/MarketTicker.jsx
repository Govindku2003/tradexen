import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getMarketQuote } from "../../services/api/marketApi";

const initialTickerData = [
  {
    symbol: "NIFTY 50",
    price: "--",
    change: "--",
  },
  {
    symbol: "SENSEX",
    price: "80,983.25",
    change: "+0.48%",
  },
  {
    symbol: "BANKNIFTY",
    price: "52,104.65",
    change: "-0.21%",
  },
  {
    symbol: "RELIANCE",
    price: "2,955.40",
    change: "+1.32%",
  },
  {
    symbol: "TCS",
    price: "3,421.85",
    change: "+0.64%",
  },
  {
    symbol: "INFY",
    price: "1,532.10",
    change: "-0.18%",
  },
  {
    symbol: "HDFCBANK",
    price: "1,648.75",
    change: "+0.41%",
  },
];

function MarketTicker() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [nifty, setNifty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchNifty = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMarketQuote("NSE_INDEX|Nifty 50");

        if (mounted) {
          setNifty(data);
        }
      } catch (err) {
        console.error("NIFTY API error:", err);

        if (mounted) {
          setError(err.message || "Unable to load NIFTY");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchNifty();

    return () => {
      mounted = false;
    };
  }, []);

  const getChangePercent = () => {
    if (
      !nifty ||
      nifty.price === null ||
      nifty.change === null ||
      nifty.change === undefined
    ) {
      return null;
    }

    const previousPrice = nifty.price - nifty.change;

    if (!previousPrice) {
      return null;
    }

    return (nifty.change / previousPrice) * 100;
  };

  const changePercent = getChangePercent();

  const niftyPrice =
    nifty?.price !== null && nifty?.price !== undefined
      ? Number(nifty.price).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "--";

  const niftyPercent =
    changePercent !== null
      ? `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`
      : "--";

  const tickerData = initialTickerData.map((item) => {
    if (item.symbol !== "NIFTY 50") {
      return item;
    }

    return {
      ...item,
      price: niftyPrice,
      change: niftyPercent,
    };
  });

  return (
    <div
      className={`mb-3 overflow-hidden rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-3 py-1.5 ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}
      >
        <span
          className={`text-[9px] font-semibold ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          MARKET TICKER
        </span>

        {loading && (
          <span className="text-[9px] text-slate-400">
            Loading...
          </span>
        )}

        {!loading && !error && (
          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live API
          </span>
        )}

        {error && (
          <span className="text-[9px] font-semibold text-red-500">
            API Error
          </span>
        )}
      </div>

      <div className="flex min-w-max overflow-x-auto">
        {tickerData.map((item) => {
          const isPositive = item.change.startsWith("+");

          return (
            <div
              key={item.symbol}
              className={`min-w-[145px] flex-1 border-r px-3 py-2.5 last:border-r-0 sm:px-4 ${
                isDark ? "border-slate-800" : "border-slate-100"
              }`}
            >
              <div
                className={`text-[10px] font-semibold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {item.symbol}
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {item.price}
                </span>

                <span
                  className={`text-[10px] font-bold ${
                    isPositive
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MarketTicker;