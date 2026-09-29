import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

// NEW:
// Actual Terminal page import kiya.
// Pehle "/" route par Placeholder render ho raha tha.
import Terminal from "../pages/Terminal";

import { useTheme } from "../context/ThemeContext";

/*
  Temporary Placeholder component

  Abhi Markets, Portfolio, Orders etc. ke liye
  ye placeholder use hoga.

  In pages ko hum baad ke steps mein
  individually build karenge.
*/
function Placeholder({ title }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      className={`min-h-[calc(100vh-4rem)] p-4 transition-colors duration-200 sm:p-6 ${
        isDark
          ? "bg-slate-950 text-slate-200"
          : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      <div
        className={`rounded-xl border p-5 sm:p-6 ${
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <h1
          className={`text-xl font-bold sm:text-2xl ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {title}
        </h1>

        <p
          className={`mt-2 text-sm ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          TradeXen trading terminal
        </p>
      </div>
    </section>
  );
}

/*
  TradeXen Router

  AppLayout common layout provide karta hai:
  - Sidebar
  - Topbar
  - Mobile Navigation

  Child routes Outlet ke andar render honge.
*/
const router = createBrowserRouter([
  {
    element: <AppLayout />,

    children: [
      /*
        TERMINAL

        IMPORTANT:
        Pehle yahan:

        <Placeholder title="TradeXen Terminal" />

        tha.

        Ab actual Terminal page render hoga.
      */
      {
        path: "/",
        element: <Terminal />,
      },

      /*
        Baaki pages abhi placeholder hain.
        Inko baad mein actual UI pages se replace karenge.
      */

      {
        path: "/markets",
        element: <Placeholder title="Markets" />,
      },

      {
        path: "/portfolio",
        element: <Placeholder title="Portfolio" />,
      },

      {
        path: "/orders",
        element: <Placeholder title="Orders" />,
      },

      {
        path: "/strategies",
        element: <Placeholder title="Strategies" />,
      },

      {
        path: "/backtesting",
        element: <Placeholder title="Backtesting" />,
      },

      {
        path: "/analytics",
        element: <Placeholder title="Analytics" />,
      },

      {
        path: "/bots",
        element: <Placeholder title="Bot Control" />,
      },

      {
        path: "/activity-logs",
        element: <Placeholder title="Activity Logs" />,
      },

      {
        path: "/settings",
        element: <Placeholder title="Settings" />,
      },
    ],
  },
]);

export default router;