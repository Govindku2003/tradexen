export default function Trading() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Trading</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Trade terminal</h1>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">BTC/USD</h2>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-sm font-medium text-emerald-400">
              Long bias
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Entry</p>
              <p className="mt-2 text-2xl font-bold text-white">$66,940</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Target</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">$68,400</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Stop</p>
              <p className="mt-2 text-2xl font-bold text-rose-400">$65,500</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Size</p>
              <p className="mt-2 text-2xl font-bold text-white">0.42 BTC</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Order ticket</h2>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Side</label>
              <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0">
                <option>Buy</option>
                <option>Sell</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Order Type</label>
              <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none ring-0">
                <option>Market</option>
                <option>Limit</option>
                <option>Stop</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-slate-300">Amount</label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none"
                defaultValue="$5,000"
              />
            </div>
            <button className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
              Place Order
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
