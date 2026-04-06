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
  
  const [customerStats, setCustomerStats] = useState([])

  // Animal symbols for repeat customers (customers with more than 1 invoice)
  const animalSymbols = [
    { emoji: '🦁', name: 'Lion' },
    { emoji: '🐯', name: 'Tiger' },
    { emoji: '🐆', name: 'Cheetah' },
    { emoji: '🐘', name: 'Elephant' },
    { emoji: '🦅', name: 'Eagle' },
    { emoji: '🐺', name: 'Wolf' },
    { emoji: '🦊', name: 'Fox' },
    { emoji: '🐻', name: 'Bear' },
    { emoji: '🦈', name: 'Shark' },
    { emoji: '🐎', name: 'Horse' },
  ]

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

    // Calculate customer-wise performance (only customers with more than 1 invoice)
    const customerMap = {}
    invoices.forEach(inv => {
      const customerName = inv.customer_name || 'Unknown'
      
      if (!customerMap[customerName]) {
        customerMap[customerName] = { 
          name: customerName, 
          invoiceCount: 0, 
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0
        }
      }
      
      customerMap[customerName].invoiceCount += 1
      customerMap[customerName].totalAmount += (inv.grand_total || 0)
      
      if (inv.payment_status === 'paid') {
        customerMap[customerName].paidAmount += (inv.grand_total || 0)
      } else {
        customerMap[customerName].pendingAmount += (inv.grand_total || 0)
      }
    })
    
    // Filter only customers with more than 1 invoice and assign animal symbols
    const repeatCustomers = Object.values(customerMap)
      .filter(customer => customer.invoiceCount > 1)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10)
      .map((customer, index) => ({
        ...customer,
        animal: animalSymbols[index] || { emoji: '🌟', name: 'Star' }
      }))
    
    setCustomerStats(repeatCustomers)
    
  }, [invoices])

  const recentInvoices = invoices.slice(0, 5)
  
  const formatAmount = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toFixed(0)}`
  }

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
          <p className="text-3xl font-bold text-blue-900">{formatAmount(stats.totalRevenue)}</p>
        </div>

        {/* Total Paid */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Paid</p>
          <p className="text-3xl font-bold text-green-600">{formatAmount(stats.totalPaid)}</p>
          <p className="text-xs text-gray-500 mt-1">Received</p>
        </div>

        {/* Total Pending */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-600">{formatAmount(stats.totalPending)}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
        </div>
      </div>

      {/* Company-wise Performance with Animal Symbols */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <h2 className="text-xl font-semibold text-gray-900">🏆 Top Repeat Customers</h2>
          <p className="text-sm text-gray-500">Companies with multiple invoices (ranked by revenue)</p>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : customerStats.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No repeat customers yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {customerStats.map((customer, index) => (
              <div 
                key={customer.name} 
                className={`relative p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                  index === 0 ? 'border-yellow-400 bg-yellow-50' :
                  index === 1 ? 'border-gray-300 bg-gray-50' :
                  index === 2 ? 'border-amber-600 bg-amber-50' :
                  'border-gray-200 bg-white'
                }`}
              >
                {/* Rank Badge */}
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-600' :
                  'bg-blue-500'
                }`}>
                  #{index + 1}
                </div>
                
                {/* Animal Symbol */}
                <div className="text-center mb-3">
                  <span className="text-5xl">{customer.animal.emoji}</span>
                  <p className="text-xs text-gray-500 mt-1">{customer.animal.name}</p>
                </div>
                
                {/* Company Name */}
                <h3 className="font-bold text-gray-900 text-center text-sm mb-2 truncate" title={customer.name}>
                  {customer.name}
                </h3>
                
                {/* Stats */}
                <div className="space-y-1 text-center">
                  <div className="text-2xl font-bold text-blue-900">{formatAmount(customer.totalAmount)}</div>
                  <div className="text-sm text-gray-600">{customer.invoiceCount} Invoices</div>
                  <div className="flex justify-center gap-2 text-xs">
                    <span className="text-green-600">✓ Paid: {formatAmount(customer.paidAmount)}</span>
                    <span className="text-amber-600">⏳ {formatAmount(customer.pendingAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">{formatAmount(invoice.grand_total)}</td>
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
