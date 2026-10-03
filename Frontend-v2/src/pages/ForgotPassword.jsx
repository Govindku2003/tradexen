import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ForgotPassword() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [method, setMethod] = useState("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (method === "email" && !email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (method === "phone" && !phone.trim()) {
      setError("Please enter your mobile number");
      return;
    }

    /*
      Backend OTP endpoint will be connected here.

      Email:
      POST /auth/forgot-password/email

      Phone:
      POST /auth/forgot-password/phone
    */

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      setOtpSent(true);

      setMessage(
        method === "email"
          ? "OTP will be sent to your email address."
          : "OTP will be sent to your mobile number.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter your new password");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    /*
      Backend endpoint will be connected here:

      POST /auth/reset-password
    */

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      setMessage(
        "Password reset flow is ready. Backend OTP verification will be connected next.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-8 ${
        isDark ? "bg-slate-950" : "bg-[#f5f7fa]"
      }`}
    >
      <div className="w-full max-w-md">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className={`mb-5 flex items-center gap-2 text-sm ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          <ArrowLeft size={16} />
          Back to login
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-white">
            <TrendingUp size={24} />
          </div>

          <h1
            className={`text-2xl font-bold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Reset your password
          </h1>

          <p
            className={`mt-2 text-sm ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Verify your account using an OTP
          </p>
        </div>

        {/* Card */}
        <div
          className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >

          {/* Method selector */}
          {!otpSent && (
            <div
              className={`mb-5 grid grid-cols-2 rounded-lg p-1 ${
                isDark ? "bg-slate-950" : "bg-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMethod("email");
                  setError("");
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  method === "email"
                    ? "bg-cyan-500 text-white"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                <Mail size={16} className="mr-2 inline" />
                Email OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod("phone");
                  setError("");
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  method === "phone"
                    ? "bg-cyan-500 text-white"
                    : isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                }`}
              >
                <Phone size={16} className="mr-2 inline" />
                SMS OTP
              </button>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">

              {method === "email" && (
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Gmail / Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com"
                      className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none ${
                        isDark
                          ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                          : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </div>
              )}

              {method === "phone" && (
                <div>
                  <label
                    className={`mb-2 block text-sm font-medium ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Mobile number
                  </label>

                  <div className="flex">
                    <div
                      className={`flex items-center rounded-l-lg border border-r-0 px-3 text-sm ${
                        isDark
                          ? "border-slate-700 bg-slate-950 text-slate-400"
                          : "border-slate-300 bg-slate-50 text-slate-600"
                      }`}
                    >
                      +91
                    </div>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`w-full rounded-r-lg border py-2.5 px-3 text-sm outline-none ${
                        isDark
                          ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
                          : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
                      }`}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div
                  className={`rounded-lg border px-3 py-2.5 text-sm ${
                    isDark
                      ? "border-red-900/60 bg-red-950/30 text-red-400"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">

              {/* OTP */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Verification OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter 6-digit OTP"
                  className={`w-full rounded-lg border px-3 py-2.5 text-center text-lg tracking-[0.4em] outline-none ${
                    isDark
                      ? "border-slate-700 bg-slate-950 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  }`}
                />
              </div>

              {/* New password */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  New password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-11 text-sm outline-none ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-900"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm your password"
                    className={`w-full rounded-lg border py-2.5 pl-10 pr-11 text-sm outline-none ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-white"
                        : "border-slate-300 bg-white text-slate-900"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-600">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="w-full text-sm font-medium text-cyan-500"
              >
                Use another method
              </button>
            </form>
          )}
        </div>

        {/* Signup */}
        <div
          className={`mt-5 text-center text-sm ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-semibold text-cyan-500"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;