const logs = [
  { time: '09:48 AM', message: 'BTC breakout alert triggered from volatility monitor.', type: 'signal' },
  { time: '09:36 AM', message: 'Momentum Pulse strategy rebalanced ETH exposure.', type: 'strategy' },
  { time: '09:12 AM', message: 'Order execution confirmed for SOL/USD buy order.', type: 'trade' },
  { time: '08:55 AM', message: 'System health check completed successfully.', type: 'system' },
]

export default function ActivityLogs() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Activity</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Recent activity logs</h1>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <ul className="space-y-4">
          {logs.map((log) => (
            <li key={`${log.time}-${log.message}`} className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  log.type === 'signal'
                    ? 'bg-cyan-400'
                    : log.type === 'strategy'
                      ? 'bg-violet-400'
                      : log.type === 'trade'
                        ? 'bg-emerald-400'
                        : 'bg-slate-400'
                }`}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-slate-200">{log.message}</p>
                  <span className="text-xs uppercase tracking-[0.15em] text-slate-400">{log.time}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
