import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
  TrendingUp,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import apiRequest from "../services/api/apiClient";

function Signup() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const navigate = useNavigate();

  const [method, setMethod] = useState("email");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | EMAIL SIGNUP
  |--------------------------------------------------------------------------
  */

  const handleEmailSignup = async (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError(
        "Name, email and password are required.",
      );

      return;
    }

    if (name.trim().length < 2) {
      setError(
        "Name must be at least 2 characters.",
      );

      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );

      return;
    }

    try {
      setLoading(true);

      await apiRequest("/auth/signup", {
        method: "POST",

        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          password,
        }),
      });

      /*
      IMPORTANT:

      Signup does NOT login the user.

      No JWT is stored here.

      User must login manually after
      successful account creation.
      */

      navigate("/login", {
        replace: true,

        state: {
          signupSuccess:
            "Account created successfully. Please login to continue.",
        },
      });
    } catch (err) {
      console.error(
        "Signup error:",
        err,
      );

      setError(
        err?.message ||
          "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PHONE SIGNUP
  |--------------------------------------------------------------------------
  */

  const handlePhoneSignup = (event) => {
    event.preventDefault();

    setError("");

    if (!name.trim() || !phone.trim()) {
      setError(
        "Name and phone number are required.",
      );

      return;
    }

    setError(
      "Phone OTP signup will be enabled after connecting the OTP service.",
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SOCIAL LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSocialLogin = (provider) => {
    setError(
      `${provider} authentication will be connected in a later step.`,
    );
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

        {/* BACK TO LOGIN */}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className={`mb-5 flex items-center gap-2 text-sm transition ${
            isDark
              ? "text-slate-400 hover:text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ArrowLeft size={16} />

          Back to login
        </button>

        {/* BRAND */}

        <div className="mb-6 text-center">

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
            Create your account
          </h1>

          <p
            className={`mt-2 text-sm ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Create your trading account to access
            the TradeXen terminal.
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

          {/* EMAIL / PHONE */}

          <div
            className={`mb-5 grid grid-cols-2 rounded-lg p-1 ${
              isDark
                ? "bg-slate-950"
                : "bg-slate-100"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setError("");
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                method === "email"
                  ? "bg-cyan-500 text-white"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail
                size={16}
                className="mr-2 inline"
              />

              Email
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod("phone");
                setError("");
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                method === "phone"
                  ? "bg-cyan-500 text-white"
                  : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Phone
                size={16}
                className="mr-2 inline"
              />

              Phone
            </button>
          </div>

          {/* FORM */}

          <form
            onSubmit={
              method === "email"
                ? handleEmailSignup
                : handlePhoneSignup
            }
            className="space-y-4"
          >

            {/* NAME */}

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-700"
                }`}
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-cyan-400"
                      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                  }`}
                />
              </div>
            </div>

            {/* EMAIL */}

            {method === "email" && (
              <>
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

                {/* PHONE */}

                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-200"
                        : "text-slate-700"
                    }`}
                  >
                    Mobile number
                    <span
                      className={`ml-1 text-xs font-normal ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      optional
                    </span>
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value,
                        )
                      }
                      placeholder="+91 9876543210"
                      autoComplete="tel"
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
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-200"
                        : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>

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
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
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
                          (value) =>
                            !value,
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
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* PHONE METHOD */}

            {method === "phone" && (
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDark
                      ? "text-slate-200"
                      : "text-slate-700"
                  }`}
                >
                  Mobile number
                </label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value,
                      )
                    }
                    placeholder="+91 9876543210"
                    autoComplete="tel"
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-cyan-400"
                        : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-cyan-500"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div
                className={`rounded-lg border px-3 py-2.5 text-sm ${
                  isDark
                    ? "border-red-900/60 bg-red-950/30 text-red-300"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {error}
              </div>
            )}

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-cyan-500 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          {/* LOGIN */}

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
              Already have an account?{" "}
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="font-semibold text-cyan-500 hover:text-cyan-400"
            >
              Login
            </button>
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
          Your account will start with a paper
          trading account.
        </p>
      </div>
    </div>
  );
}

export default Signup;