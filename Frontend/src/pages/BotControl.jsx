const bots = [
  { name: 'Alpha Grid', status: 'Online', health: '98%' },
  { name: 'Arbitrage Scout', status: 'Syncing', health: '83%' },
  { name: 'Trend Breaker', status: 'Paused', health: '74%' },
  { name: 'Volatility Engine', status: 'Online', health: '96%' },
]

export default function BotControl() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Bot control</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Automation center</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {bots.map((bot) => (
          <div key={bot.name} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{bot.name}</h2>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  bot.status === 'Online'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : bot.status === 'Paused'
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-sky-500/10 text-sky-400'
                }`}
              >
                {bot.status}
              </span>
            </div>
            <div className="mt-6">
              <p className="text-sm text-slate-400">Health score</p>
              <p className="mt-2 text-2xl font-bold text-white">{bot.health}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
