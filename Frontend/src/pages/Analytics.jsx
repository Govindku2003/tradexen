const metrics = [
  { label: 'Gross Profit', value: '$64,210', tone: 'positive' },
  { label: 'Losses', value: '$18,540', tone: 'negative' },
  { label: 'Profit Factor', value: '2.34', tone: 'positive' },
  { label: 'Avg. Trade', value: '$1,240', tone: 'neutral' },
]

export default function Analytics() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Analytics</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Performance analytics</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p
              className={`mt-3 text-3xl font-bold ${
                metric.tone === 'positive'
                  ? 'text-emerald-400'
                  : metric.tone === 'negative'
                    ? 'text-rose-400'
                    : 'text-white'
              }`}
            >
              {metric.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="text-xl font-semibold text-white">Executive summary</h2>
        <p className="mt-4 max-w-3xl text-slate-300">
          The strategy mix remains profitable with strong momentum exposure and controlled drawdowns. Risk-adjusted performance has improved materially across the last 30-day period, with stable execution quality and better diversification across correlated assets.
        </p>
      </section>
    </div>
  )
}
