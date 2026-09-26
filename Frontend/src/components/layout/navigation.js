import {
  Activity,
  BarChart3,
  Bot,
  CandlestickChart,
  ChartNoAxesCombined,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export const navigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Markets",
    path: "/markets",
    icon: CandlestickChart,
  },
  {
    label: "Trading",
    path: "/trading",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Portfolio",
    path: "/portfolio",
    icon: Wallet,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ClipboardList,
  },
  {
    label: "Strategies",
    path: "/strategies",
    icon: BarChart3,
  },
  {
    label: "Backtesting",
    path: "/backtesting",
    icon: Activity,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Bot Control",
    path: "/bot",
    icon: Bot,
  },
  {
    label: "Activity Logs",
    path: "/activity",
    icon: ShieldCheck,
  },
];

export const settingsNavigation = {
  label: "Settings",
  path: "/settings",
  icon: Settings,
};