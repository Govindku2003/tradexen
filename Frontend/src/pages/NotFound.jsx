export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">404</p>
      <h1 className="mt-4 text-4xl font-bold text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-400">
        The route you requested does not exist or has moved. Return to the dashboard to continue.
      </p>
      <button className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
        Back to dashboard
      </button>
    </div>
  )
}
