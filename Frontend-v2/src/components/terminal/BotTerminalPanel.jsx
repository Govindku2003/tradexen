import { useEffect, useState } from "react";
import {
  Bot,
  Play,
  Pause,
  Square,
  RefreshCw,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useTerminal } from "../../context/TerminalContext";

import {
  getBots,
  startBot,
  pauseBot,
  stopBot,
  getBotSignals,
} from "../../services/api/botApi";

function BotTerminalPanel() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    selectedSymbol,
  } = useTerminal();

  const [bots, setBots] =
    useState([]);

  const [selectedBotId, setSelectedBotId] =
    useState("");

  const [signals, setSignals] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const loadBots =
    async () => {
      try {
        setLoading(true);

        const data =
          await getBots();

        setBots(data);

        if (
          !selectedBotId &&
          data.length
        ) {
          setSelectedBotId(
            data[0]._id,
          );
        }
      } catch (error) {
        console.error(
          "Bot terminal error:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadBots();
  }, []);

  const selectedBot =
    bots.find(
      (bot) =>
        bot._id === selectedBotId,
    );

  const loadSignals =
    async () => {
      if (!selectedBotId) {
        return;
      }

      try {
        const data =
          await getBotSignals(
            selectedBotId,
          );

        setSignals(data);
      } catch (error) {
        console.error(
          "Bot signal history error:",
          error,
        );
      }
    };

  useEffect(() => {
    loadSignals();

    const interval =
      setInterval(
        loadSignals,
        10000,
      );

    return () =>
      clearInterval(interval);
  }, [selectedBotId]);

  const perform =
    async (action, id) => {
      try {
        await action(id);
        await loadBots();
        await loadSignals();
      } catch (error) {
        console.error(
          "Bot action error:",
          error,
        );
      }
    };

  const panel = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";

  const muted = isDark
    ? "text-slate-400"
    : "text-slate-500";

  const latestSignal =
    signals[0];

  return (
    <section
      className={`mt-3 rounded-xl border p-4 ${panel}`}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
            <Bot size={20} />
          </div>

          <div>
            <h2 className="text-sm font-bold">
              Bot Intelligence
            </h2>

            <p className={`text-[11px] ${muted}`}>
              {selectedSymbol?.symbol ||
                "--"}{" "}
              · Terminal analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBotId}
            onChange={(e) =>
              setSelectedBotId(
                e.target.value,
              )
            }
            className={`rounded-lg border px-3 py-2 text-xs ${
              isDark
                ? "border-slate-700 bg-slate-950"
                : "border-slate-200 bg-white"
            }`}
          >
            <option value="">
              Select Bot
            </option>

            {bots.map((bot) => (
              <option
                key={bot._id}
                value={bot._id}
              >
                {bot.name}
              </option>
            ))}
          </select>

          <button
            onClick={loadBots}
            className="rounded-lg border border-slate-700 p-2"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {!selectedBot ? (
        <div className={`mt-5 rounded-lg border border-dashed p-5 text-center text-sm ${muted}`}>
          Create a bot from the Bot Control Center
          and select it here.
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className={`text-[10px] ${muted}`}>
                BOT
              </p>
              <p className="text-sm font-bold">
                {selectedBot.name}
              </p>
            </div>

            <div>
              <p className={`text-[10px] ${muted}`}>
                MODE
              </p>
              <p className="text-sm font-bold">
                {selectedBot.controlMode}
              </p>
            </div>

            <div>
              <p className={`text-[10px] ${muted}`}>
                STATUS
              </p>
              <p
                className={`text-sm font-bold ${
                  selectedBot.status ===
                  "RUNNING"
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              >
                {selectedBot.status}
              </p>
            </div>

            <div>
              <p className={`text-[10px] ${muted}`}>
                SIGNAL
              </p>

              <p
                className={`text-sm font-bold ${
                  latestSignal?.signal ===
                  "BUY"
                    ? "text-emerald-500"
                    : latestSignal?.signal ===
                        "SELL"
                      ? "text-red-500"
                      : muted
                }`}
              >
                {latestSignal?.signal ||
                  selectedBot.lastSignal ||
                  "--"}
              </p>
            </div>

            <div>
              <p className={`text-[10px] ${muted}`}>
                PRICE
              </p>
              <p className="text-sm font-bold">
                {latestSignal?.price
                  ? `₹${Number(
                      latestSignal.price,
                    ).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}`
                  : "--"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
            <div>
              <div
                className={`rounded-lg border p-4 ${
                  latestSignal?.signal ===
                  "BUY"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : latestSignal?.signal ===
                        "SELL"
                      ? "border-red-500/30 bg-red-500/5"
                      : isDark
                        ? "border-slate-800"
                        : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">
                    Latest Analysis
                  </p>

                  <span
                    className={`text-sm font-black ${
                      latestSignal?.signal ===
                      "BUY"
                        ? "text-emerald-500"
                        : latestSignal?.signal ===
                            "SELL"
                          ? "text-red-500"
                          : muted
                    }`}
                  >
                    {latestSignal?.signal ||
                      "WAIT"}
                  </span>
                </div>

                <p className={`mt-2 text-xs ${muted}`}>
                  {latestSignal?.reason ||
                    "Waiting for bot analysis..."}
                </p>

                {latestSignal?.indicators && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div>
                      <p className={`text-[10px] ${muted}`}>
                        EMA
                      </p>
                      <p className="text-xs font-semibold">
                        {Number(
                          latestSignal
                            .indicators
                            ?.ema,
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className={`text-[10px] ${muted}`}>
                        Fast EMA
                      </p>
                      <p className="text-xs font-semibold">
                        {Number(
                          latestSignal
                            .indicators
                            ?.fastEMA,
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className={`text-[10px] ${muted}`}>
                        Slow EMA
                      </p>
                      <p className="text-xs font-semibold">
                        {Number(
                          latestSignal
                            .indicators
                            ?.slowEMA,
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className={`text-[10px] ${muted}`}>
                        RSI
                      </p>
                      <p className="text-xs font-semibold">
                        {Number(
                          latestSignal
                            .indicators
                            ?.rsi,
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`rounded-lg border p-4 ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-200"
              }`}
            >
              <p className="mb-3 text-xs font-bold">
                Bot Controls
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedBot.status !==
                  "RUNNING" && (
                  <button
                    onClick={() =>
                      perform(
                        startBot,
                        selectedBot._id,
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Play size={13} />
                    Start
                  </button>
                )}

                {selectedBot.status ===
                  "RUNNING" && (
                  <button
                    onClick={() =>
                      perform(
                        pauseBot,
                        selectedBot._id,
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Pause size={13} />
                    Pause
                  </button>
                )}

                {(selectedBot.status ===
                  "RUNNING" ||
                  selectedBot.status ===
                    "PAUSED") && (
                  <button
                    onClick={() =>
                      perform(
                        stopBot,
                        selectedBot._id,
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Square size={13} />
                    Stop
                  </button>
                )}
              </div>

              <p className={`mt-4 text-[11px] ${muted}`}>
                {selectedBot.controlMode ===
                "AUTO"
                  ? "Auto mode can create paper orders after strategy and risk validation."
                  : "Signal mode analyzes the market and gives BUY/SELL signals. Human remains in control of execution."}
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default BotTerminalPanel;