import {
  useEffect,
  useState,
} from "react";

import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNavigation from "./MobileNavigation";

import { useTheme } from "../../context/ThemeContext";
import apiRequest from "../../services/api/apiClient";

function GuestLanding() {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen pt-16 ${
        isDark
          ? "bg-slate-950"
          : "bg-[#f5f7fa]"
      }`}
    >
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl text-center">

          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black ${
              isDark
                ? "bg-cyan-400/10 text-cyan-400"
                : "bg-cyan-50 text-cyan-600"
            }`}
          >
            TX
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-cyan-500">
            TradeXen
          </p>

          <h1
            className={`mt-3 text-3xl font-bold tracking-tight sm:text-5xl ${
              isDark
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Your Trading Terminal
          </h1>

          <p
            className={`mx-auto mt-4 max-w-xl text-sm leading-6 sm:text-base ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Create your TradeXen account or login
            to access your paper trading account,
            portfolio, markets, orders and trading
            terminal.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() =>
                window.location.href =
                  "/signup"
              }
              className="h-11 rounded-xl bg-cyan-500 px-6 text-sm font-bold text-white transition hover:bg-cyan-600"
            >
              Create Account
            </button>

            <button
              type="button"
              onClick={() =>
                window.location.href =
                  "/login"
              }
              className={`h-11 rounded-xl border px-6 text-sm font-bold transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Login
            </button>

          </div>

          <p
            className={`mt-6 text-xs ${
              isDark
                ? "text-slate-600"
                : "text-slate-400"
            }`}
          >
            Login is required before accessing
            trading features.
          </p>
        </div>
      </div>
    </main>
  );
}

function AppLayout() {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const [authState, setAuthState] =
    useState("checking");

  const [user, setUser] =
    useState(null);

  const [tradingAccount, setTradingAccount] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | VERIFY AUTHENTICATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const verifyAuthentication =
      async () => {
        const token =
          localStorage.getItem(
            "tradexen_token",
          );

        /*
        No JWT = Guest
        */

        if (!token) {
          setAuthState("guest");

          return;
        }

        try {
          /*
          Verify JWT with backend
          */

          const response =
            await apiRequest(
              "/auth/me",
            );

          const currentUser =
            response?.data?.user ||
            null;

          const currentAccount =
            response?.data
              ?.tradingAccount ||
            null;

          if (!currentUser) {
            throw new Error(
              "Authenticated user not found",
            );
          }

          setUser(currentUser);

          setTradingAccount(
            currentAccount,
          );

          /*
          Keep local cache updated
          */

          localStorage.setItem(
            "tradexen_user",
            JSON.stringify(
              currentUser,
            ),
          );

          setAuthState(
            "authenticated",
          );
        } catch (error) {
          console.error(
            "Authentication verification failed:",
            error,
          );

          /*
          Invalid/expired token
          */

          localStorage.removeItem(
            "tradexen_token",
          );

          localStorage.removeItem(
            "tradexen_user",
          );

          setUser(null);

          setTradingAccount(null);

          setAuthState("guest");
        }
      };

    verifyAuthentication();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTH CHECK LOADING
  |--------------------------------------------------------------------------
  */

  if (authState === "checking") {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDark
            ? "bg-slate-950"
            : "bg-[#f5f7fa]"
        }`}
      >
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-500" />

          <p
            className={`mt-4 text-sm ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Checking your account...
          </p>

        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | GUEST
  |--------------------------------------------------------------------------
  */

  if (authState === "guest") {
    return (
      <div
        className={`min-h-screen ${
          isDark
            ? "bg-slate-950 text-slate-200"
            : "bg-[#f5f7fa] text-slate-900"
        }`}
      >

        <Topbar
          authenticated={false}
          user={null}
          tradingAccount={null}
        />

        <GuestLanding />

      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | AUTHENTICATED APP
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark
          ? "bg-slate-950 text-slate-200"
          : "bg-[#f5f7fa] text-slate-900"
      }`}
    >

      {/* SIDEBAR */}

      <Sidebar />

      {/* TOPBAR */}

      <Topbar
        authenticated={true}
        user={user}
        tradingAccount={tradingAccount}
      />

      {/* MAIN */}

      <main className="min-h-screen pb-16 pt-16 lg:ml-[72px] lg:pb-0">
        <div className="min-h-[calc(100vh-4rem)] w-full">
          <Outlet />
        </div>
      </main>

      {/* MOBILE NAVIGATION */}

      <MobileNavigation />

    </div>
  );
}

export default AppLayout;