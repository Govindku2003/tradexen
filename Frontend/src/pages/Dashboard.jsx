const stats = [
  { label: 'Portfolio Value', value: '$184,250.00', change: '+4.8%' },
  { label: '24h P&L', value: '+$6,420.00', change: '+2.1%' },
  { label: 'Win Rate', value: '63.4%', change: '+1.2%' },
  { label: 'Active Strategies', value: '12', change: '3 running' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Dashboard</h1>
        </div>
        <button className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
          Refresh Data
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20">
            <p className="text-sm text-slate-400">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <strong className="text-2xl font-bold text-white">{stat.value}</strong>
              <span className="text-sm font-medium text-emerald-400">{stat.change}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Performance</h2>
          <div className="mt-6 h-56 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-900 p-4">
            <div className="flex h-full items-end gap-3">
              {[42, 58, 65, 80, 72, 90, 110, 94, 118, 130, 122, 146].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-400"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Market Pulse</h2>
          <ul className="mt-6 space-y-4 text-sm text-slate-300">
            <li className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span>BTC/USD</span>
              <span className="text-emerald-400">+$1,240</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span>ETH/USD</span>
              <span className="text-emerald-400">+$84</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span>NASDAQ</span>
              <span className="text-rose-400">-$32</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Gold</span>
              <span className="text-emerald-400">+$18</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
