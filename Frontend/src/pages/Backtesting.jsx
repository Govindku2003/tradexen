export default function Backtesting() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Backtesting</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Strategy simulator</h1>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Performance summary</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Net return</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">+32.4%</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Sharpe</p>
              <p className="mt-2 text-2xl font-bold text-white">1.86</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Max drawdown</p>
              <p className="mt-2 text-2xl font-bold text-amber-300">-12.1%</p>
            </div>
          </div>

          <div className="mt-8 h-52 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 p-4">
            <div className="flex h-full items-end gap-3">
              {[25, 35, 40, 48, 52, 70, 76, 92, 86, 110, 125, 140].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-xl bg-gradient-to-t from-violet-500 to-cyan-400"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Test setup</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <p className="text-slate-400">Window</p>
              <p className="mt-2 font-medium text-white">2024-01-01 to 2024-09-30</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <p className="text-slate-400">Capital</p>
              <p className="mt-2 font-medium text-white">$100,000</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
              <p className="text-slate-400">Fee model</p>
              <p className="mt-2 font-medium text-white">0.10% per trade</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
