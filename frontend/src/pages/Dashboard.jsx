import { useEffect, useState } from 'react'
import { useInvoices } from '../contexts/InvoiceContext'

export default function Dashboard() {
  const { invoices, loading } = useInvoices()
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
  })

  useEffect(() => {
    if (invoices.length === 0) return

    const totalInvoices = invoices.length
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const totalPaid = invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const totalPending = totalRevenue - totalPaid

    setStats({
      totalInvoices,
      totalRevenue,
      totalPaid,
      totalPending,
    })
  }, [invoices])

  const recentInvoices = invoices.slice(0, 5)

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Invoices */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Invoices</p>
          <p className="text-3xl font-bold text-blue-900">{stats.totalInvoices}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-900">₹{(stats.totalRevenue / 100000).toFixed(1)}L</p>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Paid</p>
          <p className="text-3xl font-bold text-green-600">₹{(stats.totalPaid / 100000).toFixed(1)}L</p>
          <p className="text-xs text-gray-500 mt-1">Received</p>
        </div>

        {/* Total Pending */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-600">₹{(stats.totalPending / 100000).toFixed(1)}L</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Invoices</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : recentInvoices.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No invoices yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-amber-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-blue-900">{invoice.invoice_no}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{invoice.customer_name}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">₹{invoice.grand_total}</td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        invoice.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.payment_status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {invoice.payment_status?.charAt(0).toUpperCase() + invoice.payment_status?.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
