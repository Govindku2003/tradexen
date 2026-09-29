import { Bell, Moon, Search, Sun, Wifi } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function Topbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-30 h-16 border-b backdrop-blur lg:left-[72px] ${
        isDark
          ? "border-slate-800 bg-slate-950/95"
          : "border-slate-200 bg-white/95"
      }`}
    >
      <div className="flex h-full w-full items-center justify-between gap-2 px-2 sm:gap-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <div
            className={`hidden shrink-0 items-center gap-2 text-xs font-semibold md:flex ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            MARKET OPEN
          </div>

          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search
              size={16}
              strokeWidth={2}
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            />

            <input
              type="text"
              placeholder="Search symbol..."
              className={`h-9 w-full min-w-0 rounded-lg border pl-9 pr-2 text-sm font-medium outline-none transition placeholder:font-normal ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:border-cyan-400/60"
                  : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:border-cyan-500"
              } sm:w-48 md:w-56`}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
          <div
            className={`hidden items-center gap-2 text-xs font-medium lg:flex ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            <Wifi size={15} className="text-emerald-500" />
            Live
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
              isDark
                ? "border-slate-700 text-yellow-400 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
              isDark
                ? "border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                : "border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <Bell size={18} />
          </button>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-600">
            TX
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;