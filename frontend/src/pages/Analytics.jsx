import { useEffect, useState } from 'react'
import { useInvoices } from '../contexts/InvoiceContext'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export default function Analytics() {
  const { invoices, loading } = useInvoices()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalInvoices: 0,
  })
  const [companyData, setCompanyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [paymentStatusData, setPaymentStatusData] = useState({ paid: 0, pending: 0 })

  useEffect(() => {
    if (invoices.length === 0) return

    // Basic stats
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const totalPaid = invoices
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const totalPending = totalRevenue - totalPaid

    setStats({
      totalRevenue,
      totalPaid,
      totalPending,
      totalInvoices: invoices.length,
    })

    // Company-wise data - normalize customer names to combine duplicates
    const companyMap = {}
    const companyNameMap = {} // Track original names for display
    invoices.forEach(inv => {
      const company = inv.customer_name || 'Unknown Customer'
      const normalizedCompany = company.toLowerCase().trim()
      
      if (!companyMap[normalizedCompany]) {
        companyMap[normalizedCompany] = 0
        companyNameMap[normalizedCompany] = company // Store first occurrence for display
      }
      companyMap[normalizedCompany] += inv.grand_total || 0
    })

    const sortedCompanies = Object.entries(companyMap)
      .map(([normalized, revenue]) => [companyNameMap[normalized], revenue])
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 companies

    setCompanyData(sortedCompanies)

    // Parse date from DD-MM-YYYY format
    const parseDate = (dateStr) => {
      if (!dateStr) return null
      // Check if it's DD-MM-YYYY format
      if (dateStr.includes('-') && dateStr.split('-')[0].length <= 2) {
        const [day, month, year] = dateStr.split('-')
        return new Date(year, month - 1, day)
      }
      // Otherwise try ISO format
      return new Date(dateStr)
    }

    // Monthly data - properly parse DD-MM-YYYY dates
    const monthlyMap = {}
    invoices.forEach(inv => {
      const date = parseDate(inv.date)
      if (!date || isNaN(date.getTime())) return
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = 0
      }
      monthlyMap[monthKey] += inv.grand_total || 0
    })

    const sortedMonthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))

    setMonthlyData(sortedMonthly)

    // Payment status data
    setPaymentStatusData({
      paid: totalPaid,
      pending: totalPending
    })

  }, [invoices])

  const formatAmount = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount.toFixed(0)}`
  }

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Chart configurations
  const companyChartData = {
    labels: companyData.map(([name]) => name.length > 20 ? name.substring(0, 20) + '...' : name),
    datasets: [
      {
        label: 'Revenue',
        data: companyData.map(([, amount]) => amount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(20, 184, 166, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const monthlyChartData = {
    labels: monthlyData.map(([month]) => formatMonth(month)),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyData.map(([, amount]) => amount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  }

  const paymentStatusChartData = {
    labels: ['Paid', 'Pending'],
    datasets: [
      {
        data: [paymentStatusData.paid, paymentStatusData.pending],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(245, 158, 11, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(245, 158, 11, 1)'],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatAmount(context.parsed.y || context.parsed)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatAmount(value)
          }
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatAmount(context.parsed)}`
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-blue-900">{formatAmount(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Paid Amount</p>
          <p className="text-3xl font-bold text-green-600">{formatAmount(stats.totalPaid)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Pending Amount</p>
          <p className="text-3xl font-bold text-amber-600">{formatAmount(stats.totalPending)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium mb-2">Total Invoices</p>
          <p className="text-3xl font-bold text-purple-600">{stats.totalInvoices}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Company-wise Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Companies by Revenue</h2>
          <div style={{ height: '400px' }}>
            {companyData.length > 0 ? (
              <Bar data={companyChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Payment Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status Distribution</h2>
          <div style={{ height: '400px' }}>
            <Doughnut data={paymentStatusChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Revenue Trend - Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h2>
        <div style={{ height: '400px' }}>
          {monthlyData.length > 0 ? (
            <Bar data={monthlyChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Detailed Company Performance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Company Performance Details</h2>
        </div>
        
        {companyData.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No company data yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company Name</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total Revenue</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {companyData.map(([company, amount], index) => {
                const percentage = ((amount / stats.totalRevenue) * 100).toFixed(1)
                return (
                  <tr key={company} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">#{index + 1}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{company}</td>
                    <td className="px-6 py-3 text-sm font-medium text-right">{formatAmount(amount)}</td>
                    <td className="px-6 py-3 text-sm text-right">
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}