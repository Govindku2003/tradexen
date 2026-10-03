import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Power,
  Activity,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import {
  getStrategies,
  createStrategy,
  deleteStrategy,
  toggleStrategy,
} from "../services/api/strategyApi";

import { TERMINAL_SYMBOLS } from "../context/TerminalContext";

function Strategies() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [strategies, setStrategies] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      name: "",
      description: "",
      symbol: "RELIANCE",
      strategyType: "EMA_CROSSOVER",
      fastEMAPeriod: 9,
      slowEMAPeriod: 21,
      rsiPeriod: 14,
      macdFastPeriod: 12,
      macdSlowPeriod: 26,
      macdSignalPeriod: 9,
      stopLossPercent: 1,
      takeProfitPercent: 2,
      maxPositionSize: 50000,
    });

  const loadStrategies =
    async () => {
      try {
        setLoading(true);
        const data =
          await getStrategies();

        setStrategies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadStrategies();
  }, []);

  const selectedSymbol =
    TERMINAL_SYMBOLS.find(
      (item) =>
        item.symbol === form.symbol,
    );

  const handleCreate =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);
        setError("");

        await createStrategy({
          name: form.name,
          description:
            form.description,
          symbol: form.symbol,
          instrumentKey:
            selectedSymbol?.instrumentKey,
          strategyType:
            form.strategyType,
          parameters: {
            fastEMAPeriod:
              Number(
                form.fastEMAPeriod,
              ),

            slowEMAPeriod:
              Number(
                form.slowEMAPeriod,
              ),

            rsiPeriod:
              Number(form.rsiPeriod),

            macdFastPeriod:
              Number(
                form.macdFastPeriod,
              ),

            macdSlowPeriod:
              Number(
                form.macdSlowPeriod,
              ),

            macdSignalPeriod:
              Number(
                form.macdSignalPeriod,
              ),
          },

          riskSettings: {
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
          },
        });

        setShowForm(false);

        setForm({
          ...form,
          name: "",
          description: "",
        });

        await loadStrategies();
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async (id) => {
      if (
        !window.confirm(
          "Delete this strategy?",
        )
      ) {
        return;
      }

      try {
        await deleteStrategy(id);
        await loadStrategies();
      } catch (err) {
        setError(err.message);
      }
    };

  const handleToggle =
    async (id) => {
      try {
        await toggleStrategy(id);
        await loadStrategies();
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
              Strategies
            </h1>

            <p className={`mt-1 text-sm ${muted}`}>
              Configure the market logic used by
              your trading bots.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowForm(!showForm)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            New Strategy
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleCreate}
            className={`rounded-xl border p-5 ${card}`}
          >
            <h2 className="mb-4 text-lg font-bold">
              Create Strategy
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <input
                required
                placeholder="Strategy name"
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
                value={form.symbol}
                onChange={(e) =>
                  setForm({
                    ...form,
                    symbol: e.target.value,
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
                value={form.strategyType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    strategyType:
                      e.target.value,
                  })
                }
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              >
                <option value="EMA_CROSSOVER">
                  EMA Crossover
                </option>

                <option value="RSI">
                  RSI
                </option>

                <option value="MACD">
                  MACD
                </option>
              </select>

              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target.value,
                  })
                }
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2 md:col-span-2"
              />

              <input
                type="number"
                min="1"
                value={form.fastEMAPeriod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fastEMAPeriod:
                      e.target.value,
                  })
                }
                placeholder="Fast EMA"
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />

              <input
                type="number"
                min="1"
                value={form.slowEMAPeriod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slowEMAPeriod:
                      e.target.value,
                  })
                }
                placeholder="Slow EMA"
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
                placeholder="Stop Loss %"
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
                placeholder="Take Profit %"
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
                placeholder="Max Position ₹"
                className="rounded-lg border border-slate-700 bg-transparent px-3 py-2"
              />
            </div>

            <button
              disabled={saving}
              className="mt-5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create Strategy"}
            </button>
          </form>
        )}

        {loading ? (
          <div className={`rounded-xl border p-8 ${card}`}>
            Loading strategies...
          </div>
        ) : strategies.length === 0 ? (
          <div className={`rounded-xl border p-8 text-center ${card}`}>
            <Activity
              className="mx-auto mb-3 opacity-50"
              size={32}
            />

            <p className="font-semibold">
              No strategies yet
            </p>

            <p className={`mt-1 text-sm ${muted}`}>
              Create your first strategy for a bot.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {strategies.map(
              (strategy) => (
                <div
                  key={strategy._id}
                  className={`rounded-xl border p-5 ${card}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">
                        {strategy.name}
                      </h3>

                      <p className={`mt-1 text-xs ${muted}`}>
                        {strategy.symbol} ·{" "}
                        {strategy.strategyType}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        strategy.isActive
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      {strategy.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}
                    </span>
                  </div>

                  <p className={`mt-4 text-sm ${muted}`}>
                    {strategy.description ||
                      "No description"}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className={muted}>
                        SL
                      </p>
                      <p className="font-semibold">
                        {
                          strategy
                            .riskSettings
                            ?.stopLossPercent
                        }%
                      </p>
                    </div>

                    <div>
                      <p className={muted}>
                        TP
                      </p>
                      <p className="font-semibold">
                        {
                          strategy
                            .riskSettings
                            ?.takeProfitPercent
                        }%
                      </p>
                    </div>

                    <div>
                      <p className={muted}>
                        Max
                      </p>
                      <p className="font-semibold">
                        ₹
                        {Number(
                          strategy
                            .riskSettings
                            ?.maxPositionSize ||
                            0,
                        ).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() =>
                        handleToggle(
                          strategy._id,
                        )
                      }
                      className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold"
                    >
                      <Power
                        size={14}
                        className="mr-1 inline"
                      />
                      Toggle
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          strategy._id,
                        )
                      }
                      className="rounded-lg border border-red-500/30 px-3 py-2 text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Strategies;