import {
  Bell,
  ChevronDown,
  LogIn,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  UserPlus,
  UserRound,
  WalletCards,
  Wifi,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { useTheme } from "../../context/ThemeContext";

function getInitials(name = "") {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "TX";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[
    parts.length - 1
  ][0]}`.toUpperCase();
}

function Topbar({
  authenticated = false,
  user = null,
  tradingAccount = null,
}) {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isDark = theme === "dark";

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | CLOSE PROFILE ON OUTSIDE CLICK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target,
          )
        ) {
          setProfileOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | PROFILE DATA
  |--------------------------------------------------------------------------
  */

  const initials = getInitials(
    user?.name,
  );

  const accountId =
    tradingAccount?.id
      ? `TXN-${String(
          tradingAccount.id,
        )
          .slice(-8)
          .toUpperCase()}`
      : "Not available";

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    localStorage.removeItem(
      "tradexen_token",
    );

    localStorage.removeItem(
      "tradexen_user",
    );

    setProfileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header
      className={`fixed right-0 top-0 z-30 h-16 border-b backdrop-blur ${
        authenticated
          ? "left-0 lg:left-[72px]"
          : "left-0"
      } ${
        isDark
          ? "border-slate-800 bg-slate-950/95"
          : "border-slate-200 bg-white/95"
      }`}
    >

      <div className="flex h-full w-full items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">

        {/* LEFT */}

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">

          {/* GUEST BRAND */}

          {!authenticated && (
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-black text-cyan-500"
            >
              TX
            </button>
          )}

          {/* MARKET STATUS */}

          {authenticated && (
            <div
              className={`hidden shrink-0 items-center gap-2 text-xs font-semibold md:flex ${
                isDark
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              MARKET OPEN
            </div>
          )}

          {/* SEARCH */}

          {authenticated && (
            <div className="relative min-w-0 flex-1 sm:flex-none">

              <Search
                size={16}
                className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              />

              <input
                type="text"
                placeholder="Search symbol..."
                className={`h-9 w-full rounded-lg border pl-9 pr-2 text-sm outline-none sm:w-48 md:w-56 ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:border-cyan-400/60"
                    : "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:border-cyan-500"
                }`}
              />

            </div>
          )}

          {/* GUEST TITLE */}

          {!authenticated && (
            <div className="min-w-0">

              <p
                className={`text-sm font-bold ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                TradeXen
              </p>

              <p
                className={`hidden text-[11px] sm:block ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                Trading platform
              </p>

            </div>
          )}

        </div>

        {/* RIGHT */}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* LIVE */}

          {authenticated && (
            <div
              className={`hidden items-center gap-2 text-xs font-medium lg:flex ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              <Wifi
                size={15}
                className="text-emerald-500"
              />

              Live
            </div>
          )}

          {/* THEME */}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
              isDark
                ? "border-slate-700 text-yellow-400 hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDark ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* NOTIFICATION */}

          {authenticated && (
            <button
              type="button"
              aria-label="Notifications"
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isDark
                  ? "text-slate-300 hover:bg-slate-800"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Bell size={18} />
            </button>
          )}

          {/* PROFILE */}

          <div
            ref={profileRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (current) =>
                    !current,
                )
              }
              aria-label="Profile menu"
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                authenticated
                  ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                  : isDark
                    ? "border-slate-700 bg-slate-900 text-slate-300"
                    : "border-slate-300 bg-white text-slate-700"
              }`}
            >

              {authenticated ? (
                <span className="text-xs font-black">
                  {initials}
                </span>
              ) : (
                <UserRound size={18} />
              )}

            </button>

            {/* PROFILE MENU */}

            {profileOpen && (
              <div
                className={`absolute right-0 top-12 w-[280px] overflow-hidden rounded-2xl border shadow-2xl ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >

                {authenticated ? (
                  <>
                    {/* USER HEADER */}

                    <div className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white">
                          {initials}
                        </div>

                        <div className="min-w-0">

                          <p
                            className={`truncate text-sm font-bold ${
                              isDark
                                ? "text-white"
                                : "text-slate-900"
                            }`}
                          >
                            {user?.name ||
                              "User"}
                          </p>

                          <p
                            className={`truncate text-xs ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-500"
                            }`}
                          >
                            {user?.email ||
                              "No email"}
                          </p>

                        </div>

                      </div>

                      {/* ACCOUNT INFO */}

                      <div
                        className={`mt-4 rounded-xl p-3 ${
                          isDark
                            ? "bg-slate-950"
                            : "bg-slate-50"
                        }`}
                      >

                        <div className="flex items-center justify-between gap-3">

                          <span
                            className={`text-xs ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-500"
                            }`}
                          >
                            Account ID
                          </span>

                          <span
                            className={`font-mono text-xs font-bold ${
                              isDark
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {accountId}
                          </span>

                        </div>

                        <div className="mt-2 flex items-center justify-between">

                          <span
                            className={`text-xs ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-500"
                            }`}
                          >
                            Account
                          </span>

                          <span className="text-xs font-bold text-emerald-500">
                            Active
                          </span>

                        </div>

                      </div>
                    </div>

                    {/* MENU */}

                    <div
                      className={`border-t p-2 ${
                        isDark
                          ? "border-slate-800"
                          : "border-slate-200"
                      }`}
                    >

                      <ProfileMenuItem
                        icon={UserRound}
                        label="My Profile"
                        onClick={() => {
                          setProfileOpen(
                            false,
                          );

                          navigate(
                            "/portfolio",
                          );
                        }}
                        isDark={isDark}
                      />

                      <ProfileMenuItem
                        icon={WalletCards}
                        label="Trading Account"
                        onClick={() => {
                          setProfileOpen(
                            false,
                          );

                          navigate(
                            "/portfolio",
                          );
                        }}
                        isDark={isDark}
                      />

                      <ProfileMenuItem
                        icon={Settings}
                        label="Settings"
                        onClick={() => {
                          setProfileOpen(
                            false,
                          );

                          navigate(
                            "/settings",
                          );
                        }}
                        isDark={isDark}
                      />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 transition ${
                          isDark
                            ? "hover:bg-red-950/30"
                            : "hover:bg-red-50"
                        }`}
                      >
                        <LogOut size={17} />

                        Logout
                      </button>

                    </div>
                  </>
                ) : (
                  <>
                    {/* GUEST PROFILE */}

                    <div className="p-4">

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                            isDark
                              ? "bg-cyan-400/10 text-cyan-400"
                              : "bg-cyan-50 text-cyan-600"
                          }`}
                        >
                          <UserRound
                            size={20}
                          />
                        </div>

                        <div>

                          <p
                            className={`text-sm font-bold ${
                              isDark
                                ? "text-white"
                                : "text-slate-900"
                            }`}
                          >
                            Welcome to TradeXen
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              isDark
                                ? "text-slate-500"
                                : "text-slate-500"
                            }`}
                          >
                            Account required
                          </p>

                        </div>

                      </div>

                    </div>

                    <div
                      className={`border-t p-2 ${
                        isDark
                          ? "border-slate-800"
                          : "border-slate-200"
                      }`}
                    >

                      <ProfileMenuItem
                        icon={UserPlus}
                        label="Create Account"
                        onClick={() => {
                          setProfileOpen(
                            false,
                          );

                          navigate(
                            "/signup",
                          );
                        }}
                        isDark={isDark}
                      />

                      <ProfileMenuItem
                        icon={LogIn}
                        label="Login"
                        onClick={() => {
                          setProfileOpen(
                            false,
                          );

                          navigate(
                            "/login",
                          );
                        }}
                        isDark={isDark}
                      />

                    </div>
                  </>
                )}

              </div>
            )}

          </div>

          {authenticated && (
            <ChevronDown
              size={14}
              className={`hidden sm:block ${
                isDark
                  ? "text-slate-600"
                  : "text-slate-400"
              }`}
            />
          )}

        </div>

      </div>
    </header>
  );
}

/*
|--------------------------------------------------------------------------
| PROFILE MENU ITEM
|--------------------------------------------------------------------------
*/

function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
  isDark,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        isDark
          ? "text-slate-300 hover:bg-slate-800 hover:text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Icon size={17} />

      {label}
    </button>
  );
}

export default Topbar;