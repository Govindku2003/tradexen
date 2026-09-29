import { Plus, Search, Star } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const watchlist = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: "2,955.40",
    change: "+1.32%",
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy",
    price: "3,421.85",
    change: "+0.64%",
  },
  {
    symbol: "INFY",
    name: "Infosys",
    price: "1,532.10",
    change: "-0.18%",
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    price: "1,648.75",
    change: "+0.41%",
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank",
    price: "1,245.20",
    change: "+0.73%",
  },
];

function Watchlist() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`h-full overflow-hidden rounded-xl border ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b px-3 py-3 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <Star
            size={15}
            className="text-cyan-500"
          />

          <h2
            className={`text-xs font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Watchlist
          </h2>
        </div>

        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500"
          title="Add symbol"
        >
          <Plus size={15} />
        </button>
      </div>

      <div
        className={`border-b px-3 py-2 ${
          isDark ? "border-slate-800" : "border-slate-100"
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
              isDark ? "text-slate-500" : "text-slate-400"
            }
          />

          <input
            type="text"
            placeholder="Search symbol"
            className={`h-8 w-full bg-transparent text-xs outline-none ${
              isDark
                ? "text-white placeholder:text-slate-500"
                : "text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
      </div>

      <div>
        {watchlist.map((item) => {
          const positive = item.change.startsWith("+");

          return (
            <button
              type="button"
              key={item.symbol}
              className={`flex w-full items-center justify-between border-b px-3 py-3 text-left ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-100"
              }`}
            >
              <div>
                <div
                  className={`text-xs font-bold ${
                    isDark
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

              <div className="text-right">
                <div
                  className={`text-xs font-semibold ${
                    isDark
                      ? "text-slate-200"
                      : "text-slate-800"
                  }`}
                >
                  {item.price}
                </div>

                <div
                  className={`mt-0.5 text-[10px] font-semibold ${
                    positive
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {item.change}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Watchlist;