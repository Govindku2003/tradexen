export default function Settings() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Settings</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Platform preferences</h1>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Account</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-3">
              <span>Email notifications</span>
              <span className="text-emerald-400">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-3">
              <span>Two-factor auth</span>
              <span className="text-emerald-400">Active</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-3">
              <span>Default timezone</span>
              <span className="text-white">UTC</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Automation</h2>
          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-3">
              <span>Paper trading</span>
              <span className="text-emerald-400">Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-3">
              <span>Auto-rebalance</span>
              <span className="text-amber-300">Scheduled</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-3">
              <span>Risk guardrails</span>
              <span className="text-white">Standard</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
