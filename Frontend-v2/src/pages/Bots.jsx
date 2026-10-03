import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Play,
  Pause,
  Square,
  Trash2,
  Pencil,
  X,
  Save,
  Bot as BotIcon,
  Activity,
  Settings2,
  TrendingUp,
  BarChart3,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

import {
  getBots,
  createBot,
  updateBot,
  startBot,
  pauseBot,
  stopBot,
  deleteBot,
} from "../services/api/botApi";

import { getStrategies } from "../services/api/strategyApi";

import { TERMINAL_SYMBOLS } from "../context/TerminalContext";

const DEFAULT_FORM = {
  name: "",
  strategy: "",
  symbol: "RELIANCE",
  controlMode: "SIGNAL",
  quantity: 1,
  timeframe: "5",
  stopLossPercent: 1,
  takeProfitPercent: 2,
  maxPositionSize: 50000,
  dailyLossLimit: 5000,
  allowBuy: true,
  allowSell: true,
};

const STATUS_STYLES = {
  RUNNING:
    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  STARTING:
    "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PAUSED:
    "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ERROR:
    "bg-red-500/10 text-red-500 border-red-500/20",
  STOPPED:
    "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

function Bots() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [bots, setBots] = useState([]);
  const [strategies, setStrategies] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingBot, setEditingBot] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(DEFAULT_FORM);

  const card = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";

  const inputClass = isDark
    ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500"
    : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400";

  const muted = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const selectedSymbol = useMemo(
    () =>
      TERMINAL_SYMBOLS.find(
        (item) => item.symbol === form.symbol,
      ),
    [form.symbol],
  );

  const selectedStrategy = useMemo(
    () =>
      strategies.find(
        (item) => item._id === form.strategy,
      ),
    [strategies, form.strategy],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [botData, strategyData] =
        await Promise.all([
          getBots(),
          getStrategies(),
        ]);

      setBots(Array.isArray(botData) ? botData : []);
      setStrategies(
        Array.isArray(strategyData)
          ? strategyData
          : [],
      );

      if (
        !form.strategy &&
        strategyData?.length &&
        !editingBot
      ) {
        setForm((prev) => ({
          ...prev,
          strategy: strategyData[0]._id,
          symbol:
            strategyData[0].symbol ||
            prev.symbol,
        }));
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to load bot control center",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      ...DEFAULT_FORM,
      strategy:
        strategies[0]?._id || "",
      symbol:
        strategies[0]?.symbol ||
        DEFAULT_FORM.symbol,
    });

    setEditingBot(null);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");

    resetForm();
    setShowForm(true);
  };

  const openEditForm = (bot) => {
    setError("");
    setSuccess("");

    setEditingBot(bot);

    setForm({
      name: bot.name || "",
      strategy:
        bot.strategy?._id ||
        bot.strategy ||
        "",
      symbol:
        bot.symbol || "RELIANCE",
      controlMode:
        bot.controlMode || "SIGNAL",
      quantity:
        bot.quantity || 1,
      timeframe:
        bot.timeframe || "5",
      stopLossPercent:
        bot.settings?.stopLossPercent ?? 1,
      takeProfitPercent:
        bot.settings?.takeProfitPercent ?? 2,
      maxPositionSize:
        bot.settings?.maxPositionSize ?? 50000,
      dailyLossLimit:
        bot.settings?.dailyLossLimit ?? 5000,
      allowBuy:
        bot.settings?.allowBuy ?? true,
      allowSell:
        bot.settings?.allowSell ?? true,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    resetForm();
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStrategyChange = (strategyId) => {
    const strategy = strategies.find(
      (item) => item._id === strategyId,
    );

    setForm((prev) => ({
      ...prev,
      strategy: strategyId,
      symbol:
        strategy?.symbol ||
        prev.symbol,
    }));
  };

  const handleModeChange = (mode) => {
    setForm((prev) => ({
      ...prev,
      controlMode: mode,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.strategy) {
        throw new Error(
          "Please select a strategy",
        );
      }

      const strategy =
        strategies.find(
          (item) =>
            item._id === form.strategy,
        );

      const instrumentKey =
        selectedSymbol?.instrumentKey ||
        strategy?.instrumentKey;

      if (!instrumentKey) {
        throw new Error(
          "Instrument key not found for selected symbol",
        );
      }

      const payload = {
        name: form.name.trim(),
        strategy: form.strategy,
        symbol: form.symbol,
        instrumentKey,
        controlMode: form.controlMode,
        quantity: Number(form.quantity),
        timeframe: form.timeframe,
        settings: {
          stopLossPercent:
            Number(form.stopLossPercent),
          takeProfitPercent:
            Number(form.takeProfitPercent),
          maxPositionSize:
            Number(form.maxPositionSize),
          dailyLossLimit:
            Number(form.dailyLossLimit),
          allowBuy: Boolean(form.allowBuy),
          allowSell: Boolean(form.allowSell),
          autoExecute:
            form.controlMode === "AUTO",
        },
      };

      if (!payload.name) {
        throw new Error(
          "Bot name is required",
        );
      }

      if (payload.quantity < 1) {
        throw new Error(
          "Quantity must be at least 1",
        );
      }

      if (editingBot) {
        await updateBot(
          editingBot._id,
          payload,
        );

        setSuccess(
          "Bot configuration updated successfully.",
        );
      } else {
        await createBot(payload);

        setSuccess(
          "Bot created successfully.",
        );
      }

      setShowForm(false);
      resetForm();

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Unable to save bot",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (
    action,
    botId,
    successMessage,
  ) => {
    try {
      setActionLoading(botId);
      setError("");
      setSuccess("");

      await action(botId);

      setSuccess(successMessage);

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Bot action failed",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (bot) => {
    const confirmed =
      window.confirm(
        `Delete "${bot.name}"? This will also remove the bot's stored signals.`,
      );

    if (!confirmed) return;

    await handleAction(
      deleteBot,
      bot._id,
      "Bot deleted successfully.",
    );
  };

  const getStatusClass = (status) =>
    STATUS_STYLES[status] ||
    STATUS_STYLES.STOPPED;

  const getModeLabel = (mode) => {
    if (mode === "AUTO") {
      return "Fully Automated";
    }

    return "Signal Assistant";
  };

  const totalRunning = bots.filter(
    (bot) =>
      bot.status === "RUNNING",
  ).length;

  const totalPaused = bots.filter(
    (bot) =>
      bot.status === "PAUSED",
  ).length;

  const totalSignals = bots.reduce(
    (sum, bot) =>
      sum + Number(bot.totalSignals || 0),
    0,
  );

  const totalTrades = bots.reduce(
    (sum, bot) =>
      sum + Number(bot.totalTrades || 0),
    0,
  );

  return (
    <section
      className={`min-h-[calc(100vh-4rem)] p-3 sm:p-5 lg:p-6 ${
        isDark
          ? "bg-slate-950 text-slate-200"
          : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isDark
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                <BotIcon size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  Bot Control Center
                </h1>

                <p
                  className={`mt-0.5 text-xs sm:text-sm ${muted}`}
                >
                  Manage strategies, automated paper
                  trading and bot lifecycle.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <Plus size={17} />
            Create Bot
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            icon={<Activity size={18} />}
            label="Running Bots"
            value={totalRunning}
            isDark={isDark}
          />

          <SummaryCard
            icon={<Pause size={18} />}
            label="Paused Bots"
            value={totalPaused}
            isDark={isDark}
          />

          <SummaryCard
            icon={<TrendingUp size={18} />}
            label="Total Signals"
            value={totalSignals}
            isDark={isDark}
          />

          <SummaryCard
            icon={<BarChart3 size={18} />}
            label="Total Trades"
            value={totalTrades}
            isDark={isDark}
          />
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className={`rounded-2xl border p-4 sm:p-5 lg:p-6 ${card}`}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Settings2
                    size={18}
                    className="text-indigo-500"
                  />

                  <h2 className="font-bold">
                    {editingBot
                      ? "Edit Bot Configuration"
                      : "Create Bot"}
                  </h2>
                </div>

                <p
                  className={`mt-1 text-xs ${muted}`}
                >
                  Configure strategy, execution mode,
                  position size and risk controls.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className={`rounded-lg p-2 ${
                  isDark
                    ? "hover:bg-slate-800"
                    : "hover:bg-slate-100"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Name */}
              <Field label="Bot Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    handleChange(
                      "name",
                      e.target.value,
                    )
                  }
                  placeholder="e.g. Reliance Momentum Bot"
                  className={inputClass}
                />
              </Field>

              {/* Strategy */}
              <Field label="Strategy">
                <select
                  required
                  value={form.strategy}
                  onChange={(e) =>
                    handleStrategyChange(
                      e.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select strategy
                  </option>

                  {strategies.map(
                    (strategy) => (
                      <option
                        key={strategy._id}
                        value={strategy._id}
                      >
                        {strategy.name}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              {/* Symbol */}
              <Field label="Trading Symbol">
                <select
                  value={form.symbol}
                  onChange={(e) =>
                    handleChange(
                      "symbol",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                >
                  {TERMINAL_SYMBOLS.map(
                    (item) => (
                      <option
                        key={item.symbol}
                        value={item.symbol}
                      >
                        {item.symbol} —{" "}
                        {item.name}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              {/* Mode */}
              <Field label="Control Mode">
                <select
                  value={form.controlMode}
                  onChange={(e) =>
                    handleModeChange(
                      e.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="SIGNAL">
                    Signal Assistant
                  </option>

                  <option value="AUTO">
                    Fully Automated
                  </option>
                </select>
              </Field>

              {/* Timeframe */}
              <Field label="Timeframe">
                <select
                  value={form.timeframe}
                  onChange={(e) =>
                    handleChange(
                      "timeframe",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                >
                  <option value="1">
                    1 Minute
                  </option>

                  <option value="5">
                    5 Minutes
                  </option>

                  <option value="15">
                    15 Minutes
                  </option>

                  <option value="30">
                    30 Minutes
                  </option>

                  <option value="60">
                    1 Hour
                  </option>
                </select>
              </Field>

              {/* Quantity */}
              <Field label="Order Quantity">
                <input
                  type="number"
                  min="1"
                  required
                  value={form.quantity}
                  onChange={(e) =>
                    handleChange(
                      "quantity",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              {/* SL */}
              <Field label="Stop Loss (%)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.stopLossPercent}
                  onChange={(e) =>
                    handleChange(
                      "stopLossPercent",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              {/* TP */}
              <Field label="Take Profit (%)">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.takeProfitPercent}
                  onChange={(e) =>
                    handleChange(
                      "takeProfitPercent",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              {/* Max Position */}
              <Field label="Max Position Size">
                <input
                  type="number"
                  min="0"
                  value={form.maxPositionSize}
                  onChange={(e) =>
                    handleChange(
                      "maxPositionSize",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              {/* Daily Loss */}
              <Field label="Daily Loss Limit">
                <input
                  type="number"
                  min="0"
                  value={form.dailyLossLimit}
                  onChange={(e) =>
                    handleChange(
                      "dailyLossLimit",
                      e.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            {/* Risk Controls */}
            <div
              className={`mt-5 rounded-xl border p-4 ${
                isDark
                  ? "border-slate-800 bg-slate-950/50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <h3 className="text-sm font-semibold">
                Trading Permissions
              </h3>

              <p
                className={`mt-1 text-xs ${muted}`}
              >
                Decide which trade directions the bot
                is allowed to process.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowBuy}
                    onChange={(e) =>
                      handleChange(
                        "allowBuy",
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded"
                  />

                  <span>Allow BUY signals</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowSell}
                    onChange={(e) =>
                      handleChange(
                        "allowSell",
                        e.target.checked,
                      )
                    }
                    className="h-4 w-4 rounded"
                  />

                  <span>Allow SELL signals</span>
                </label>
              </div>
            </div>

            {/* Configuration Preview */}
            <div
              className={`mt-5 rounded-xl border p-4 ${
                isDark
                  ? "border-indigo-500/20 bg-indigo-500/5"
                  : "border-indigo-200 bg-indigo-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                Configuration Preview
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <PreviewItem
                  label="Symbol"
                  value={form.symbol}
                  muted={muted}
                />

                <PreviewItem
                  label="Strategy"
                  value={
                    selectedStrategy?.name ||
                    "Not selected"
                  }
                  muted={muted}
                />

                <PreviewItem
                  label="Mode"
                  value={getModeLabel(
                    form.controlMode,
                  )}
                  muted={muted}
                />

                <PreviewItem
                  label="Instrument"
                  value={
                    selectedSymbol?.instrumentKey ||
                    selectedStrategy?.instrumentKey ||
                    "Not available"
                  }
                  muted={muted}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  isDark
                    ? "border-slate-700 hover:bg-slate-800"
                    : "border-slate-300 hover:bg-slate-50"
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingBot ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}

                {saving
                  ? "Saving..."
                  : editingBot
                    ? "Update Bot"
                    : "Create Bot"}
              </button>
            </div>
          </form>
        )}

        {/* Bot List */}
        {loading ? (
          <div
            className={`rounded-2xl border p-10 text-center ${card}`}
          >
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />

            <p
              className={`mt-3 text-sm ${muted}`}
            >
              Loading bots...
            </p>
          </div>
        ) : bots.length === 0 ? (
          <div
            className={`rounded-2xl border p-10 text-center ${card}`}
          >
            <BotIcon
              size={42}
              className="mx-auto mb-4 opacity-40"
            />

            <h2 className="font-semibold">
              No bots configured
            </h2>

            <p
              className={`mx-auto mt-1 max-w-md text-sm ${muted}`}
            >
              Create your first bot and configure
              its strategy, risk controls and execution
              mode.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Create Your First Bot
            </button>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {bots.map((bot) => {
              const busy =
                actionLoading === bot._id;

              return (
                <div
                  key={bot._id}
                  className={`rounded-2xl border p-4 sm:p-5 ${card}`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isDark
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "bg-indigo-50 text-indigo-600"
                          }`}
                        >
                          <BotIcon size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-bold">
                            {bot.name}
                          </h3>

                          <p
                            className={`mt-0.5 truncate text-xs ${muted}`}
                          >
                            {bot.symbol} ·{" "}
                            {bot.strategy?.name ||
                              "Strategy"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                        bot.status,
                      )}`}
                    >
                      {bot.status}
                    </span>
                  </div>

                  {/* Main Info */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <InfoItem
                      label="Mode"
                      value={
                        bot.controlMode
                      }
                      muted={muted}
                    />

                    <InfoItem
                      label="Timeframe"
                      value={`${bot.timeframe}m`}
                      muted={muted}
                    />

                    <InfoItem
                      label="Quantity"
                      value={bot.quantity}
                      muted={muted}
                    />

                    <InfoItem
                      label="Signal"
                      value={
                        bot.lastSignal ||
                        "--"
                      }
                      muted={muted}
                    />
                  </div>

                  {/* Stats */}
                  <div
                    className={`mt-4 grid grid-cols-3 divide-x rounded-xl border ${
                      isDark
                        ? "divide-slate-800 border-slate-800 bg-slate-950/40"
                        : "divide-slate-200 border-slate-200 bg-slate-50"
                    }`}
                  >
                    <StatItem
                      label="Signals"
                      value={
                        bot.totalSignals || 0
                      }
                      muted={muted}
                    />

                    <StatItem
                      label="Orders"
                      value={
                        bot.totalOrders || 0
                      }
                      muted={muted}
                    />

                    <StatItem
                      label="Trades"
                      value={
                        bot.totalTrades || 0
                      }
                      muted={muted}
                    />
                  </div>

                  {/* Risk */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    <RiskItem
                      label="SL"
                      value={`${bot.settings?.stopLossPercent ?? 0}%`}
                      muted={muted}
                    />

                    <RiskItem
                      label="TP"
                      value={`${bot.settings?.takeProfitPercent ?? 0}%`}
                      muted={muted}
                    />

                    <RiskItem
                      label="Max Position"
                      value={formatNumber(
                        bot.settings
                          ?.maxPositionSize,
                      )}
                      muted={muted}
                    />

                    <RiskItem
                      label="Daily Loss"
                      value={formatNumber(
                        bot.settings
                          ?.dailyLossLimit,
                      )}
                      muted={muted}
                    />
                  </div>

                  {/* Permissions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <PermissionBadge
                      label="BUY"
                      enabled={
                        bot.settings
                          ?.allowBuy
                      }
                    />

                    <PermissionBadge
                      label="SELL"
                      enabled={
                        bot.settings
                          ?.allowSell
                      }
                    />

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        bot.mode === "PAPER"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      {bot.mode || "PAPER"} MODE
                    </span>
                  </div>

                  {/* Error */}
                  {bot.errorMessage && (
                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                      <p className="font-semibold">
                        Bot Error
                      </p>

                      <p className="mt-1 break-words">
                        {bot.errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Last Activity */}
                  {bot.lastAnalysisAt && (
                    <p
                      className={`mt-4 text-[11px] ${muted}`}
                    >
                      Last analysis:{" "}
                      {formatDate(
                        bot.lastAnalysisAt,
                      )}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {/* Start / Resume */}
                    {bot.status !==
                      "RUNNING" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleAction(
                            startBot,
                            bot._id,
                            bot.status ===
                              "PAUSED"
                              ? "Bot resumed successfully."
                              : "Bot started successfully.",
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Play size={14} />

                        {busy
                          ? "Working..."
                          : bot.status ===
                              "PAUSED"
                            ? "Resume"
                            : "Start"}
                      </button>
                    )}

                    {/* Pause */}
                    {bot.status ===
                      "RUNNING" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleAction(
                            pauseBot,
                            bot._id,
                            "Bot paused successfully.",
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pause size={14} />
                        {busy
                          ? "Working..."
                          : "Pause"}
                      </button>
                    )}

                    {/* Stop */}
                    {(bot.status ===
                      "RUNNING" ||
                      bot.status ===
                        "PAUSED" ||
                      bot.status ===
                        "STARTING") && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleAction(
                            stopBot,
                            bot._id,
                            "Bot stopped successfully.",
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Square size={14} />
                        Stop
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      type="button"
                      disabled={
                        busy ||
                        bot.status ===
                          "RUNNING"
                      }
                      onClick={() =>
                        openEditForm(bot)
                      }
                      title={
                        bot.status ===
                        "RUNNING"
                          ? "Stop the bot before editing trading configuration"
                          : "Edit bot"
                      }
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                        isDark
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        handleDelete(bot)
                      }
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ----------------------------- */
/* Small UI Components            */
/* ----------------------------- */

function SummaryCard({
  icon,
  label,
  value,
  isDark,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-indigo-500">
          {icon}
        </span>

        <span className="text-xl font-bold">
          {value}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">
        {label}
      </span>

      {children}
    </label>
  );
}

function InfoItem({
  label,
  value,
  muted,
}) {
  return (
    <div className="min-w-0">
      <p
        className={`text-[11px] ${muted}`}
      >
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

function StatItem({
  label,
  value,
  muted,
}) {
  return (
    <div className="p-3 text-center">
      <p
        className={`text-[10px] uppercase tracking-wide ${muted}`}
      >
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function RiskItem({
  label,
  value,
  muted,
}) {
  return (
    <div>
      <p
        className={`text-[10px] ${muted}`}
      >
        {label}
      </p>

      <p className="mt-1 truncate font-semibold">
        {value}
      </p>
    </div>
  );
}

function PreviewItem({
  label,
  value,
  muted,
}) {
  return (
    <div className="min-w-0">
      <p className={`text-[10px] ${muted}`}>
        {label}
      </p>

      <p className="mt-1 truncate font-semibold">
        {value}
      </p>
    </div>
  );
}

function PermissionBadge({
  label,
  enabled,
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        enabled
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-red-500/10 text-red-500"
      }`}
    >
      {label} {enabled ? "ON" : "OFF"}
    </span>
  );
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(
    number,
  );
}

function formatDate(value) {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default Bots;