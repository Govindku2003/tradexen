const strategies = [
  { name: 'Momentum Pulse', status: 'Running', pnl: '+$2,140', winRate: '68%' },
  { name: 'Mean Reversion', status: 'Backtest', pnl: '+$980', winRate: '57%' },
  { name: 'Breakout Grid', status: 'Paused', pnl: '+$640', winRate: '61%' },
  { name: 'Volatility Shield', status: 'Running', pnl: '+$1,920', winRate: '71%' },
]

export default function Strategies() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Strategies</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Strategy engine</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {strategies.map((strategy) => (
          <div key={strategy.name} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{strategy.name}</h2>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  strategy.status === 'Running'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : strategy.status === 'Paused'
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-sky-500/10 text-sky-400'
                }`}
              >
                {strategy.status}
              </span>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-300">
                <span>P&L</span>
                <span className="font-medium text-white">{strategy.pnl}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Win rate</span>
                <span className="font-medium text-white">{strategy.winRate}</span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
