import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useInvoices } from '../contexts/InvoiceContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Analytics() {
  const { invoices, loading } = useInvoices()
  const [chartData, setChartData] = useState(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalInvoices: 0,
    paidCount: 0,
    pendingCount: 0
  })

  useEffect(() => {
    if (invoices.length === 0) return

    // Sort invoices chronologically (oldest to newest)
    const sortedInvoices = [...invoices].sort((a, b) => {
      // Parse date DD-MM-YYYY
      const [dayA, monthA, yearA] = a.date.split('-')
      const [dayB, monthB, yearB] = b.date.split('-')
      const dateA = new Date(yearA, monthA - 1, dayA)
      const dateB = new Date(yearB, monthB - 1, dayB)
      return dateA - dateB
    })

    // Prepare data for graph
    const labels = []
    const revenueData = []
    const paidData = []
    const pendingData = []
    let cumulativeRevenue = 0
    let cumulativePaid = 0
    let cumulativePending = 0

    sortedInvoices.forEach((inv, index) => {
      // Add invoice number as label
      labels.push(`#${inv.invoice_no}`)
      
      // Calculate cumulative totals
      cumulativeRevenue += inv.grand_total || 0
      if (inv.payment_status === 'paid') {
        cumulativePaid += inv.grand_total || 0
      } else {
        cumulativePending += inv.grand_total || 0
      }
      
      revenueData.push(cumulativeRevenue)
      paidData.push(cumulativePaid)
      pendingData.push(cumulativePending)
    })

    // Calculate overall stats
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const paidInvoices = invoices.filter(inv => inv.payment_status === 'paid')
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const totalPending = totalRevenue - totalPaid

    setStats({
      totalRevenue,
      totalPaid,
      totalPending,
      totalInvoices: invoices.length,
      paidCount: paidInvoices.length,
      pendingCount: invoices.length - paidInvoices.length
    })

    setChartData({
      labels,
      datasets: [
        {
          label: 'Total Revenue',
          data: revenueData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
        },
        {
          label: 'Paid',
          data: paidData,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        },
        {
          label: 'Pending',
          data: pendingData,
          borderColor: 'rgb(251, 146, 60)',
          backgroundColor: 'rgba(251, 146, 60, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
        }
      ]
    })
  }, [invoices])

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500">No invoices available</p>
        <p className="text-sm text-gray-400 mt-2">Create your first invoice to see analytics</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">📊 Revenue Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(2)}L</p>
          <p className="text-blue-200 text-xs mt-2">{stats.totalInvoices} invoices</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Paid</p>
          <p className="text-3xl font-bold">₹{(stats.totalPaid / 100000).toFixed(2)}L</p>
          <p className="text-green-200 text-xs mt-2">{stats.paidCount} invoices</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-amber-100 text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold">₹{(stats.totalPending / 100000).toFixed(2)}L</p>
          <p className="text-amber-200 text-xs mt-2">{stats.pendingCount} invoices</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Collection Rate</p>
          <p className="text-3xl font-bold">{((stats.totalPaid / stats.totalRevenue) * 100).toFixed(1)}%</p>
          <p className="text-purple-200 text-xs mt-2">of total revenue</p>
        </div>
      </div>

      {/* Main Graph */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Cumulative Revenue Growth
          </h2>
          <p className="text-sm text-gray-500">
            From Invoice #1 to #{invoices[invoices.length - 1]?.invoice_no || 'Latest'}
          </p>
        </div>

        {chartData && (
          <div style={{ height: '400px' }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => '₹' + (value / 100000).toFixed(1) + 'L'
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                      autoSkip: true,
                      maxTicksLimit: 20
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label || ''
                        const value = context.parsed.y
                        return `${label}: ₹${(value / 100000).toFixed(2)}L`
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How to read this graph:</strong> This shows the cumulative (total) revenue as each invoice is added, 
          from your first invoice to your latest. The blue line shows total revenue, green shows how much has been paid, 
          and orange shows pending payments.
        </p>
      </div>
    </div>
  )
}
