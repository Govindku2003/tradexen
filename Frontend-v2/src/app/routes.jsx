import {
  createBrowserRouter,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import Terminal from "../pages/Terminal";
import Markets from "../pages/Markets";
import Portfolio from "../pages/Portfolio";
import Orders from "../pages/Orders";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";

import Backtesting from "../pages/Backtesting";

import { useTheme } from "../context/ThemeContext";
import Strategies from "../pages/Strategies";
import Bots from "../pages/Bots";

/*
|--------------------------------------------------------------------------
| PLACEHOLDER
|--------------------------------------------------------------------------
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
            isDark
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          {title}
        </h1>

        <p
          className={`mt-2 text-sm ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          TradeXen trading terminal
        </p>
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const router = createBrowserRouter([
  /*
  |--------------------------------------------------------------------------
  | PUBLIC AUTH ROUTES
  |--------------------------------------------------------------------------
  */

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/signup",
    element: <Signup />,
  },

  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  /*
  |--------------------------------------------------------------------------
  | TRADING APPLICATION
  |--------------------------------------------------------------------------
  */

  {
    element: <AppLayout />,

    children: [
      /*
      |--------------------------------------------------------------------------
      | TERMINAL
      |--------------------------------------------------------------------------
      */

      {
        path: "/",
        element: <Terminal />,
      },

      /*
      |--------------------------------------------------------------------------
      | MARKETS
      |--------------------------------------------------------------------------
      */

      {
        path: "/markets",
        element: <Markets />,
      },

      /*
      |--------------------------------------------------------------------------
      | PORTFOLIO
      |--------------------------------------------------------------------------
      */

      {
        path: "/portfolio",
        element: <Portfolio />,
      },

      /*
      |--------------------------------------------------------------------------
      | ORDERS
      |--------------------------------------------------------------------------
      */

      {
        path: "/orders",
        element: <Orders />,
      },

      /*
      |--------------------------------------------------------------------------
      | STRATEGIES
      |--------------------------------------------------------------------------
      */

      {
  path: "/strategies",
  element: <Strategies />,
},

      /*
      |--------------------------------------------------------------------------
      | BACKTESTING
      |--------------------------------------------------------------------------
      */

      {
        path: "/backtesting",
        element: <Backtesting />,
      },

      /*
      |--------------------------------------------------------------------------
      | ANALYTICS
      |--------------------------------------------------------------------------
      */

      {
        path: "/analytics",
        element: (
          <Placeholder title="Analytics" />
        ),
      },

      /*
      |--------------------------------------------------------------------------
      | BOTS
      |--------------------------------------------------------------------------
      */

      {
  path: "/bots",
  element: <Bots />,
},

      /*
      |--------------------------------------------------------------------------
      | ACTIVITY LOGS
      |--------------------------------------------------------------------------
      */

      {
        path: "/activity-logs",
        element: (
          <Placeholder title="Activity Logs" />
        ),
      },

      /*
      |--------------------------------------------------------------------------
      | SETTINGS
      |--------------------------------------------------------------------------
      */

      {
        path: "/settings",
        element: (
          <Placeholder title="Settings" />
        ),
      },
    ],
  },
]);

export default router;