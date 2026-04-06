import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { useInvoices } from '../contexts/InvoiceContext'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler)

export default function Analytics() {
  const { invoices, loading } = useInvoices()
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyAverage: 0,
    totalPaid: 0,
    totalPending: 0,
    highestRevenueMonth: '',
    highestRevenueAmount: 0,
    totalInvoices: 0,
    paidCount: 0,
    pendingCount: 0,
  })
  const [chartData, setChartData] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    if (invoices.length === 0) return

    // Get available years
    const years = [...new Set(invoices.map(inv => {
      const date = new Date(inv.date)
      return date.getFullYear()
    }))].sort((a, b) => b - a)
    setAvailableYears(years)

    // Filter by selected year
    const yearInvoices = invoices.filter(inv => {
      const date = new Date(inv.date)
      return date.getFullYear() === selectedYear
    })

    // Calculate overall stats
    const totalRevenue = yearInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const paidInvoices = yearInvoices.filter(inv => inv.payment_status === 'paid')
    const pendingInvoices = yearInvoices.filter(inv => inv.payment_status !== 'paid')
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0)
    const totalPending = totalRevenue - totalPaid

    // Group by month
    const monthlyData = {}
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Initialize all months
    allMonths.forEach((month, idx) => {
      const monthKey = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`
      monthlyData[monthKey] = {
        label: month,
        revenue: 0,
        paid: 0,
        pending: 0,
        count: 0,
      }
    })

    yearInvoices.forEach(inv => {
      const date = new Date(inv.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += inv.grand_total || 0
        monthlyData[monthKey].count += 1
        if (inv.payment_status === 'paid') {
          monthlyData[monthKey].paid += inv.grand_total || 0
        } else {
          monthlyData[monthKey].pending += inv.grand_total || 0
        }
      }
    })

    // Sort by month
    const sortedMonths = Object.entries(monthlyData).sort(([a], [b]) => a.localeCompare(b))

    const monthLabels = sortedMonths.map(([, data]) => data.label)
    const revenueData = sortedMonths.map(([, data]) => data.revenue)
    const paidData = sortedMonths.map(([, data]) => data.paid)
    const pendingData = sortedMonths.map(([, data]) => data.pending)
    const countData = sortedMonths.map(([, data]) => data.count)

    // Find highest revenue month
    let highestRevenueMonth = ''
    let highestRevenueAmount = 0
    sortedMonths.forEach(([, data]) => {
      if (data.revenue > highestRevenueAmount) {
        highestRevenueAmount = data.revenue
        highestRevenueMonth = data.label
      }
    })

    // Calculate growth (compare to previous month)
    const growthData = revenueData.map((val, idx) => {
      if (idx === 0) return 0
      const prev = revenueData[idx - 1]
      if (prev === 0) return 0
      return ((val - prev) / prev * 100).toFixed(1)
    })

    setStats({
      totalRevenue,
      monthlyAverage: yearInvoices.length > 0 ? Math.round(totalRevenue / yearInvoices.length) : 0,
      totalPaid,
      totalPending,
      highestRevenueMonth,
      highestRevenueAmount,
      totalInvoices: yearInvoices.length,
      paidCount: paidInvoices.length,
      pendingCount: pendingInvoices.length,
    })

    setChartData({
      monthLabels,
      revenueData,
      paidData,
      pendingData,
      countData,
      growthData,
    })
  }, [invoices, selectedYear])

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>
  }

  return (
    <div>
      {/* Title with Year Selector */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Performance</h1>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">₹{(stats.totalRevenue / 100000).toFixed(2)}L</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-blue-200 text-xs mt-2">{stats.totalInvoices} invoices in {selectedYear}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Paid Amount</p>
              <p className="text-3xl font-bold">₹{(stats.totalPaid / 100000).toFixed(2)}L</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-200 text-xs mt-2">{stats.paidCount} invoices paid</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">Pending Amount</p>
              <p className="text-3xl font-bold">₹{(stats.totalPending / 100000).toFixed(2)}L</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-amber-200 text-xs mt-2">{stats.pendingCount} invoices pending</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Best Month</p>
              <p className="text-3xl font-bold">{stats.highestRevenueMonth || '—'}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-purple-200 text-xs mt-2">₹{(stats.highestRevenueAmount / 1000).toFixed(0)}K revenue</p>
        </div>
      </div>

      {/* Charts */}
      {chartData && (
        <div className="space-y-6">
          {/* Monthly Revenue Trend with Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend - {selectedYear}</h2>
              <Line
                data={{
                  labels: chartData.monthLabels,
                  datasets: [
                    {
                      label: 'Revenue (₹)',
                      data: chartData.revenueData,
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#3b82f6',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 5,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `₹${context.raw.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: { 
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `₹${(value/1000).toFixed(0)}K`
                      }
                    },
                  },
                }}
              />
            </div>

            {/* Payment Status Doughnut */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
              <Doughnut
                data={{
                  labels: ['Paid', 'Pending'],
                  datasets: [
                    {
                      data: [stats.totalPaid, stats.totalPending],
                      backgroundColor: ['#10b981', '#f59e0b'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { 
                      position: 'bottom',
                      labels: { padding: 20 }
                    },
                  },
                  cutout: '60%',
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Collection Rate: <span className="font-bold text-green-600">
                    {stats.totalRevenue > 0 ? ((stats.totalPaid / stats.totalRevenue) * 100).toFixed(1) : 0}%
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Paid vs Pending Stacked Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paid vs Pending by Month</h2>
            <Bar
              data={{
                labels: chartData.monthLabels,
                datasets: [
                  {
                    label: 'Paid',
                    data: chartData.paidData,
                    backgroundColor: '#10b981',
                    borderRadius: 4,
                  },
                  {
                    label: 'Pending',
                    data: chartData.pendingData,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { 
                    display: true,
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ₹${context.raw.toLocaleString()}`
                    }
                  }
                },
                scales: {
                  x: { stacked: true },
                  y: { 
                    stacked: true, 
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${(value/1000).toFixed(0)}K`
                    }
                  },
                },
              }}
            />
          </div>

          {/* Invoice Count and Average */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Count by Month</h2>
              <Bar
                data={{
                  labels: chartData.monthLabels,
                  datasets: [
                    {
                      label: 'Invoices',
                      data: chartData.countData,
                      backgroundColor: '#8b5cf6',
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                  },
                }}
              />
            </div>

            {/* Monthly Performance Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h2>
              <div className="overflow-auto max-h-72">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Month</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Revenue</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Count</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.monthLabels.map((month, idx) => (
                      <tr key={month} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{month}</td>
                        <td className="px-3 py-2 text-right text-gray-700">₹{(chartData.revenueData[idx] / 1000).toFixed(1)}K</td>
                        <td className="px-3 py-2 text-right text-gray-700">{chartData.countData[idx]}</td>
                        <td className={`px-3 py-2 text-right font-medium ${
                          parseFloat(chartData.growthData[idx]) > 0 ? 'text-green-600' : 
                          parseFloat(chartData.growthData[idx]) < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {idx === 0 ? '—' : `${chartData.growthData[idx]}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
