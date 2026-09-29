import { CandlestickChart, LayoutDashboard, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const items = [
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
];

function MobileNavigation() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t lg:hidden ${
        isDark
          ? "border-slate-800 bg-slate-950"
          : "border-slate-200 bg-white"
      }`}
    >
      {items.map(({ label, icon: Icon, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${
              isActive
                ? isDark
                  ? "text-cyan-400"
                  : "text-cyan-600"
                : isDark
                  ? "text-slate-400"
                  : "text-slate-700"
            }`
          }
        >
          <Icon size={18} />
          <span className="text-[10px]">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNavigation;