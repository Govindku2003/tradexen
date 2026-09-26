import { createBrowserRouter } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import Dashboard from "../pages/Dashboard";
import Markets from "../pages/Markets";
import Trading from "../pages/Trading";
import Portfolio from "../pages/Portfolio";
import Orders from "../pages/Orders";
import Strategies from "../pages/Strategies";
import Backtesting from "../pages/Backtesting";
import Analytics from "../pages/Analytics";
import BotControl from "../pages/BotControl";
import ActivityLogs from "../pages/ActivityLogs";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "markets",
        element: <Markets />,
      },
      {
        path: "trading",
        element: <Trading />,
      },
      {
        path: "portfolio",
        element: <Portfolio />,
      },
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "strategies",
        element: <Strategies />,
      },
      {
        path: "backtesting",
        element: <Backtesting />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "bot",
        element: <BotControl />,
      },
      {
        path: "activity",
        element: <ActivityLogs />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);