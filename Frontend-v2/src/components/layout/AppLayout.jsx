import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNavigation from "./MobileNavigation";
import { useTheme } from "../../context/ThemeContext";

function AppLayout() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark
          ? "bg-slate-950 text-slate-200"
          : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      <Sidebar />

      <Topbar />

      <main className="min-h-screen pt-16 pb-16 lg:ml-[72px] lg:pb-0">
        <div className="min-h-[calc(100vh-4rem)] w-full">
          <Outlet />
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}

export default AppLayout;