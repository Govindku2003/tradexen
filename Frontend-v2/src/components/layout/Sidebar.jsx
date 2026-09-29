import {
  Activity,
  BarChart3,
  Bot,
  CandlestickChart,
  FlaskConical,
  LayoutDashboard,
  Settings,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const navigation = [
  {
    label: "Terminal",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Markets",
    icon: CandlestickChart,
    path: "/markets",
  },
  {
    label: "Portfolio",
    icon: Wallet,
    path: "/portfolio",
  },
  {
    label: "Orders",
    icon: Activity,
    path: "/orders",
  },
  {
    label: "Strategies",
    icon: BarChart3,
    path: "/strategies",
  },
  {
    label: "Backtesting",
    icon: FlaskConical,
    path: "/backtesting",
  },
  {
    label: "Bots",
    icon: Bot,
    path: "/bots",
  },
];

function Sidebar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col border-r lg:flex ${
        isDark
          ? "border-slate-800 bg-slate-950"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex h-16 shrink-0 items-center justify-center border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <NavLink
          to="/"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-black text-cyan-600"
        >
          TX
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex min-h-0 flex-1 flex-col items-center gap-2 py-4">
        {navigation.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            title={label}
            className={({ isActive }) =>
              `relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isActive
                  ? isDark
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "bg-cyan-50 text-cyan-600"
                  : isDark
                    ? "text-slate-400"
                    : "text-slate-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-[1px] h-6 w-0.5 rounded-full bg-cyan-500" />
                )}

                <Icon size={19} strokeWidth={1.9} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div
        className={`flex shrink-0 justify-center border-t py-4 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <NavLink
          to="/settings"
          title="Settings"
          className={({ isActive }) =>
            `flex h-11 w-11 items-center justify-center rounded-xl ${
              isActive
                ? isDark
                  ? "bg-cyan-400/10 text-cyan-400"
                  : "bg-cyan-50 text-cyan-600"
                : isDark
                  ? "text-slate-400"
                  : "text-slate-700"
            }`
          }
        >
          <Settings size={19} strokeWidth={1.9} />
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;