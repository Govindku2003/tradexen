import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  TrendingUp,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import apiRequest from "../services/api/apiClient";

function Login() {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [socialLoading, setSocialLoading] =
    useState("");

  const [error, setError] =
    useState("");

  const signupSuccess =
    location.state?.signupSuccess || "";

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Email and password are required.",
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await apiRequest("/auth/login", {
          method: "POST",

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

      const token =
        response?.data?.token;

      const user =
        response?.data?.user;

      if (!token) {
        throw new Error(
          "Login successful, but authentication token was not received.",
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SAVE AUTHENTICATION
      |--------------------------------------------------------------------------
      */

      localStorage.setItem(
        "tradexen_token",
        token,
      );

      localStorage.setItem(
        "tradexen_user",
        JSON.stringify(user || {}),
      );

      /*
      |--------------------------------------------------------------------------
      | GO TO TRADING TERMINAL
      |--------------------------------------------------------------------------
      */

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Login error:",
        err,
      );

      setError(
        err?.message ||
          "Unable to login.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SOCIAL LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSocialLogin = (provider) => {
    setError("");

    setSocialLoading(provider);

    setTimeout(() => {
      setSocialLoading("");

      setError(
        `${provider} authentication will be connected in a later step.`,
      );
    }, 700);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-8 ${
        isDark
          ? "bg-slate-950"
          : "bg-[#f5f7fa]"
      }`}
    >
      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="mb-7 text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
            <TrendingUp size={24} />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">
            TradeXen
          </p>

          <h1
            className={`mt-2 text-2xl font-bold ${
              isDark
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Welcome back
          </h1>

          <p
            className={`mt-2 text-sm ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Login to access your trading terminal.
          </p>
        </div>

        {/* CARD */}

        <div
          className={`rounded-2xl border p-6 shadow-xl sm:p-8 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >

          {/* SIGNUP SUCCESS */}

          {signupSuccess && (
            <div
              className={`mb-5 rounded-lg border px-3 py-2.5 text-sm ${
                isDark
                  ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {signupSuccess}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className={`mb-5 rounded-lg border px-3 py-2.5 text-sm ${
                isDark
                  ? "border-red-900/60 bg-red-950/30 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {/* LOGIN FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* EMAIL */}

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-700"
                }`}
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  required
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-cyan-400"
                      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                  }`}
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  className={`block text-sm font-medium ${
                    isDark
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/forgot-password",
                    )
                  }
                  className="text-xs font-semibold text-cyan-500 hover:text-cyan-400"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-11 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-cyan-400"
                      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* SIGN IN */}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-cyan-500 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          {/* DIVIDER */}

          <div className="my-6 flex items-center gap-3">
            <div
              className={`h-px flex-1 ${
                isDark
                  ? "bg-slate-800"
                  : "bg-slate-200"
              }`}
            />

            <span
              className={`text-[10px] font-semibold tracking-wider ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              OR CONTINUE WITH
            </span>

            <div
              className={`h-px flex-1 ${
                isDark
                  ? "bg-slate-800"
                  : "bg-slate-200"
              }`}
            />
          </div>

          {/* SOCIAL */}

          <div className="grid grid-cols-2 gap-3">

            <button
              type="button"
              disabled={!!socialLoading}
              onClick={() =>
                handleSocialLogin(
                  "Google",
                )
              }
              className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                isDark
                  ? "border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-base font-bold">
                G
              </span>

              {socialLoading ===
              "Google"
                ? "..."
                : "Google"}
            </button>

            <button
              type="button"
              disabled={!!socialLoading}
              onClick={() =>
                handleSocialLogin(
                  "GitHub",
                )
              }
              className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                isDark
                  ? "border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-xs font-black">
                GH
              </span>

              {socialLoading ===
              "GitHub"
                ? "..."
                : "GitHub"}
            </button>
          </div>

          {/* SIGNUP */}

          <div
            className={`mt-6 border-t pt-5 text-center text-sm ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <span
              className={
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            >
              Don't have an account?{" "}
            </span>

            <Link
              to="/signup"
              className="font-semibold text-cyan-500 hover:text-cyan-400"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* FOOTER */}

        <p
          className={`mt-5 text-center text-xs ${
            isDark
              ? "text-slate-600"
              : "text-slate-400"
          }`}
        >
          Secure TradeXen paper trading platform
        </p>
      </div>
    </div>
  );
}

export default Login;