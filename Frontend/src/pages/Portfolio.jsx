const holdings = [
  { symbol: 'BTC', amount: '0.82', value: '$55,250', delta: '+6.4%' },
  { symbol: 'ETH', amount: '8.6', value: '$29,400', delta: '+3.1%' },
  { symbol: 'SOL', amount: '120', value: '$19,420', delta: '+8.2%' },
  { symbol: 'USDT', amount: '18,250', value: '$18,250', delta: '0.0%' },
]

export default function Portfolio() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Portfolio</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Holdings overview</h1>
        </div>
        <button className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500">
          Export CSV
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Net Value</p>
          <p className="mt-3 text-3xl font-bold text-white">$122,320</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Day Change</p>
          <p className="mt-3 text-3xl font-bold text-emerald-400">+$2,840</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Exposure</p>
          <p className="mt-3 text-3xl font-bold text-white">72.4%</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Asset</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.symbol} className="border-t border-slate-800 text-slate-200">
                  <td className="py-3 font-medium text-white">{holding.symbol}</td>
                  <td className="py-3">{holding.amount}</td>
                  <td className="py-3">{holding.value}</td>
                  <td className={`py-3 ${holding.delta.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {holding.delta}
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
