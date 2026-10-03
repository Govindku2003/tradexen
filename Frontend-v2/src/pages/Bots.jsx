import { useEffect, useState } from "react";
import {
  Plus,
  Play,
  Pause,
  Square,
  Trash2,
  Bot as BotIcon,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";

import {
  getBots,
  createBot,
  startBot,
  pauseBot,
  stopBot,
  deleteBot,
} from "../services/api/botApi";

import { getStrategies } from "../services/api/strategyApi";

import { TERMINAL_SYMBOLS } from "../context/TerminalContext";

function Bots() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [bots, setBots] =
    useState([]);

  const [strategies, setStrategies] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
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
    });

  const loadData =
    async () => {
      try {
        setLoading(true);

        const [
          botData,
          strategyData,
        ] = await Promise.all([
          getBots(),
          getStrategies(),
        ]);

        setBots(botData);
        setStrategies(
          strategyData,
        );

        if (
          !form.strategy &&
          strategyData.length
        ) {
          setForm((prev) => ({
            ...prev,
            strategy:
              strategyData[0]._id,
            symbol:
              strategyData[0].symbol,
          }));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, []);

  const selectedSymbol =
    TERMINAL_SYMBOLS.find(
      (item) =>
        item.symbol === form.symbol,
    );

  const create =
    async (event) => {
      event.preventDefault();

      try {
        setError("");

        const strategy =
          strategies.find(
            (item) =>
              item._id ===
              form.strategy,
          );

        await createBot({
          name: form.name,
          strategy:
            form.strategy,
          symbol:
            form.symbol,
          instrumentKey:
            selectedSymbol?.instrumentKey ||
            strategy?.instrumentKey,
          controlMode:
            form.controlMode,
          quantity:
            Number(form.quantity),
          timeframe:
            form.timeframe,
          settings: {
            stopLossPercent:
              Number(
                form.stopLossPercent,
              ),

            takeProfitPercent:
              Number(
                form.takeProfitPercent,
              ),

            maxPositionSize:
              Number(
                form.maxPositionSize,
              ),

            dailyLossLimit:
              Number(
                form.dailyLossLimit,
              ),

            allowBuy: true,
            allowSell: true,
            autoExecute:
              form.controlMode ===
              "AUTO",
          },
        });

        setShowForm(false);

        setForm((prev) => ({
          ...prev,
          name: "",
        }));

        await loadData();
      } catch (err) {
        setError(err.message);
      }
    };

  const action =
    async (fn, id) => {
      try {
        await fn(id);
        await loadData();
      } catch (err) {
        setError(err.message);
      }
    };

  const card = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";

  const muted = isDark
    ? "text-slate-400"
    : "text-slate-500";

  return (
    <section
      className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 ${
        isDark
          ? "bg-slate-950 text-slate-200"
          : "bg-[#f5f7fa] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Bot Control Center
            </h1>

            <p className={`mt-1 text-sm ${muted}`}>
              Signal assistant and fully automated paper
              trading bots.
            </p>
          </div>

          <button
            onClick={() =>
              setShowForm(!showForm)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Create Bot
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={create}
            className={`rounded-xl border p-5 ${card}`}
          >
            <h2 className="mb-4 font-bold">
              Bot Configuration
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <input
                required
                placeholder="Bot name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />

              <select
                required
                value={form.strategy}
                onChange={(e) => {
                  const strategy =
                    strategies.find(
                      (item) =>
                        item._id ===
                        e.target.value,
                    );

                  setForm({
                    ...form,
                    strategy:
                      e.target.value,
                    symbol:
                      strategy?.symbol ||
                      form.symbol,
                  });
                }}
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              >
                <option value="">
                  Select strategy
                </option>

                {strategies.map(
                  (strategy) => (
                    <option
                      key={strategy._id}
                      value={
                        strategy._id
                      }
                    >
                      {strategy.name}
                    </option>
                  ),
                )}
              </select>

              <select
                value={form.symbol}
                onChange={(e) =>
                  setForm({
                    ...form,
                    symbol:
                      e.target.value,
                  })
                }
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              >
                {TERMINAL_SYMBOLS.map(
                  (item) => (
                    <option
                      key={item.symbol}
                      value={item.symbol}
                    >
                      {item.symbol}
                    </option>
                  ),
                )}
              </select>

              <select
                value={form.controlMode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    controlMode:
                      e.target.value,
                  })
                }
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              >
                <option value="SIGNAL">
                  Signal Assistant
                </option>

                <option value="AUTO">
                  Fully Automated
                </option>
              </select>

              <select
                value={form.timeframe}
                onChange={(e) =>
                  setForm({
                    ...form,
                    timeframe:
                      e.target.value,
                  })
                }
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
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

              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity:
                      e.target.value,
                  })
                }
                placeholder="Quantity"
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                value={form.stopLossPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stopLossPercent:
                      e.target.value,
                  })
                }
                placeholder="SL %"
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />

              <input
                type="number"
                min="0"
                step="0.1"
                value={form.takeProfitPercent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    takeProfitPercent:
                      e.target.value,
                  })
                }
                placeholder="TP %"
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />

              <input
                type="number"
                min="0"
                value={form.maxPositionSize}
                onChange={(e) =>
                  setForm({
                    ...form,
                    maxPositionSize:
                      e.target.value,
                  })
                }
                placeholder="Max Position"
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />

              <input
                type="number"
                min="0"
                value={form.dailyLossLimit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dailyLossLimit:
                      e.target.value,
                  })
                }
                placeholder="Daily Loss Limit"
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />
            </div>

            <button className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
              Create Bot
            </button>
          </form>
        )}

        {loading ? (
          <div className={`rounded-xl border p-8 ${card}`}>
            Loading bots...
          </div>
        ) : bots.length === 0 ? (
          <div className={`rounded-xl border p-10 text-center ${card}`}>
            <BotIcon
              size={36}
              className="mx-auto mb-3 opacity-50"
            />

            <p className="font-semibold">
              No bots configured
            </p>

            <p className={`mt-1 text-sm ${muted}`}>
              Create a bot and choose Signal Assistant
              or Fully Automated mode.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {bots.map((bot) => (
              <div
                key={bot._id}
                className={`rounded-xl border p-5 ${card}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      {bot.name}
                    </h3>

                    <p className={`mt-1 text-xs ${muted}`}>
                      {bot.symbol} ·{" "}
                      {bot.strategy?.name ||
                        "Strategy"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      bot.status ===
                      "RUNNING"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : bot.status ===
                            "ERROR"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-slate-500/10 text-slate-500"
                    }`}
                  >
                    {bot.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className={muted}>
                      Mode
                    </p>
                    <p className="font-semibold">
                      {bot.controlMode}
                    </p>
                  </div>

                  <div>
                    <p className={muted}>
                      Signal
                    </p>
                    <p className="font-semibold">
                      {bot.lastSignal ||
                        "--"}
                    </p>
                  </div>

                  <div>
                    <p className={muted}>
                      Signals
                    </p>
                    <p className="font-semibold">
                      {bot.totalSignals}
                    </p>
                  </div>

                  <div>
                    <p className={muted}>
                      Trades
                    </p>
                    <p className="font-semibold">
                      {bot.totalTrades}
                    </p>
                  </div>
                </div>

                {bot.errorMessage && (
                  <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs text-red-500">
                    {bot.errorMessage}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  {bot.status !==
                    "RUNNING" && (
                    <button
                      onClick={() =>
                        action(
                          startBot,
                          bot._id,
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Play size={14} />
                      Start
                    </button>
                  )}

                  {bot.status ===
                    "RUNNING" && (
                    <button
                      onClick={() =>
                        action(
                          pauseBot,
                          bot._id,
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Pause size={14} />
                      Pause
                    </button>
                  )}

                  {(bot.status ===
                    "RUNNING" ||
                    bot.status ===
                      "PAUSED") && (
                    <button
                      onClick={() =>
                        action(
                          stopBot,
                          bot._id,
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Square size={14} />
                      Stop
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Delete this bot?",
                        )
                      ) {
                        action(
                          deleteBot,
                          bot._id,
                        );
                      }
                    }}
                    className="ml-auto rounded-lg border border-red-500/30 px-3 py-2 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Bots;