import { useState, useMemo } from 'react'
import { useInvoices } from '../contexts/InvoiceContext'
import { useNavigate } from 'react-router-dom'

// Check password for view/status actions
const checkViewPassword = () => {
  const pwd = prompt('Enter password:')
  if (pwd !== '1981') {
    alert('Incorrect password!')
    return false
  }
  return true
}

// Check delete confirmation
const checkDeleteConfirmation = () => {
  const confirmation = prompt('Type "DELETE" to continue:')
  if (confirmation !== 'DELETE') {
    alert('Incorrect! You must type DELETE to proceed.')
    return false
  }
  return true
}

// Parse date from DD-MM-YYYY or YYYY-MM-DD format
function parseDate(dateStr) {
  if (!dateStr) return null
  // Check if it's DD-MM-YYYY format
  if (dateStr.includes('-') && dateStr.split('-')[0].length <= 2) {
    const [day, month, year] = dateStr.split('-')
    return new Date(year, month - 1, day)
  }
  // Otherwise try ISO format
  return new Date(dateStr)
}

// Format date for display
function formatDate(dateStr) {
  const date = parseDate(dateStr)
  if (!date || isNaN(date.getTime())) return dateStr || 'N/A'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Normalize batch names to only 2025-2026 or 2026-2027
function normalizeBatch(batch) {
  if (!batch) return '2025-2026'
  const batchLower = batch.toLowerCase()
  if (batchLower.includes('2026-27') || batchLower.includes('2026-2027')) {
    return '2026-2027'
  }
  return '2025-2026'
}

export default function AllInvoices() {
  const { invoices, loading, deleteInvoice, updateInvoiceStatus } = useInvoices()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedMonths, setExpandedMonths] = useState({})

  // Group invoices by batch (only 2 batches: 2025-2026 and 2026-2027)
  const groupedInvoices = useMemo(() => {
    let filtered = invoices

    if (searchTerm.trim()) {
      filtered = invoices.filter(
        inv =>
          inv.invoice_no.includes(searchTerm) ||
          inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    const grouped = {}
    filtered.forEach(inv => {
      // Normalize batch name to only 2 options
      const batchName = normalizeBatch(inv.batch)
      
      if (!grouped[batchName]) {
        grouped[batchName] = { invoices: [] }
      }
      grouped[batchName].invoices.push(inv)
    })

    // Sort batches (2026-2027 first, then 2025-2026)
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [invoices, searchTerm])

  const toggleBatch = (batchKey) => {
    setExpandedMonths(prev => ({
      ...prev,
      [batchKey]: !prev[batchKey]
    }))
  }

  const handleView = (id) => {
    if (!checkViewPassword()) return
    navigate(`/invoices/${id}`)
  }

  const handleDelete = async (id) => {
    if (!checkDeleteConfirmation()) return
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  const handleStatusToggle = async (id, currentStatus) => {
    if (!checkViewPassword()) return
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    try {
      await updateInvoiceStatus(id, newStatus)
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

  return (
    <div>
      {/* Header and Search */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Invoices</h1>
        <input
          type="text"
          placeholder="Search invoice number or customer..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : Object.keys(groupedInvoices).length === 0 ? (
        <div className="text-center py-8 text-gray-500">No invoices found</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedInvoices).map(([batchKey, { invoices: batchInvoices }]) => {
            const isExpanded = expandedMonths[batchKey] !== false
            const totalRevenue = batchInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
            const totalPaid = batchInvoices
              .filter(inv => inv.payment_status === 'paid')
              .reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
            const totalPending = totalRevenue - totalPaid

            return (
              <div key={batchKey} className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
                {/* Batch Header */}
                <button
                  onClick={() => toggleBatch(batchKey)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-left flex justify-between items-center transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-lg">{batchKey}</span>
                    <span className="text-blue-100 text-sm">({batchInvoices.length} invoices)</span>
                    <span className="text-white text-sm">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-green-100 font-medium">Paid: ₹{(totalPaid/100000).toFixed(2)}L</div>
                    <div className="text-amber-100 font-medium">Pending: ₹{(totalPending/100000).toFixed(2)}L</div>
                    <div className="text-white font-bold">Total: ₹{(totalRevenue/100000).toFixed(2)}L</div>
                  </div>
                </button>

                {/* Batch Content */}
                {isExpanded && (
                  <table className="w-full">
                    <thead className="bg-blue-50 border-t border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchInvoices
                        .sort((a, b) => parseInt(b.invoice_no) - parseInt(a.invoice_no))
                        .map((invoice) => (
                        <tr key={invoice.id} className="border-t border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-blue-900">{invoice.invoice_no}</td>
                          <td className="px-6 py-3 text-sm text-gray-700">{formatDate(invoice.date)}</td>
                          <td className="px-6 py-3 text-sm text-gray-700">{invoice.customer_name}</td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">₹{invoice.grand_total}</td>
                          <td className="px-6 py-3 text-sm">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                                invoice.payment_status === 'paid'
                                  ? 'bg-green-100 text-green-700'
                                  : invoice.payment_status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                              onClick={() => handleStatusToggle(invoice.id, invoice.payment_status)}
                            >
                              {invoice.payment_status?.charAt(0).toUpperCase() + invoice.payment_status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm space-x-2">
                            <button
                              onClick={() => handleView(invoice.id)}
                              className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.id)}
                              className="inline-block px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
