function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
            TradeXen
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Algorithmic Trading Platform
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Real-time market intelligence, strategy testing, risk management
            and paper trading in one responsive platform.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Explore Dashboard
            </button>

            <button className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500">
              View Markets
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App