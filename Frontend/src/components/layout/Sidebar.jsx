import { NavLink } from "react-router-dom";
import { navigation, settingsNavigation } from "./navigation";

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-800 bg-slate-950 lg:flex">
      <div className="flex h-full w-full flex-col">
        {/* Logo / Brand */}
        <div className="flex h-20 shrink-0 items-center border-b border-slate-800 px-6">
          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              TradeXen
            </p>

            <p className="text-xs text-slate-500">
              Trading Intelligence
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={18} />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="shrink-0 border-t border-slate-800 p-4">
          <NavLink
            to={settingsNavigation.path}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white",
              ].join(" ")
            }
          >
            <settingsNavigation.icon size={18} />

            <span>{settingsNavigation.label}</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;