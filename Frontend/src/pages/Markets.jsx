const marketRows = [
  { pair: 'BTC/USD', price: '$67,350.10', change: '+2.45%', trend: 'up' },
  { pair: 'ETH/USD', price: '$3,420.20', change: '+1.80%', trend: 'up' },
  { pair: 'SOL/USD', price: '$162.48', change: '-0.66%', trend: 'down' },
  { pair: 'NVDA', price: '$1,184.40', change: '+0.92%', trend: 'up' },
  { pair: 'AAPL', price: '$214.60', change: '-0.31%', trend: 'down' },
]

export default function Markets() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Markets</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Market overview</h1>
        </div>
        <button className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500">
          Watchlist
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Pair</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">24h</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {marketRows.map((row) => (
                <tr key={row.pair} className="border-t border-slate-800 text-slate-200">
                  <td className="py-3 font-medium text-white">{row.pair}</td>
                  <td className="py-3">{row.price}</td>
                  <td className={`py-3 ${row.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.change}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        row.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {row.trend === 'up' ? 'Bullish' : 'Bearish'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
