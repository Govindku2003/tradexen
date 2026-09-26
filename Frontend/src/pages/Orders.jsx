const orders = [
  { id: 'ORD-1048', pair: 'BTC/USD', side: 'Buy', status: 'Filled', amount: '$5,000', time: '09:42 AM' },
  { id: 'ORD-1047', pair: 'ETH/USD', side: 'Sell', status: 'Partial', amount: '$2,800', time: '08:15 AM' },
  { id: 'ORD-1046', pair: 'SOL/USD', side: 'Buy', status: 'Open', amount: '$1,200', time: 'Yesterday' },
]

export default function Orders() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">Orders</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Recent orders</h1>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Pair</th>
                <th className="pb-3 font-medium">Side</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-800 text-slate-200">
                  <td className="py-3 font-medium text-white">{order.id}</td>
                  <td className="py-3">{order.pair}</td>
                  <td className={`py-3 ${order.side === 'Buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {order.side}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === 'Filled'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : order.status === 'Partial'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3">{order.amount}</td>
                  <td className="py-3 text-slate-400">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
