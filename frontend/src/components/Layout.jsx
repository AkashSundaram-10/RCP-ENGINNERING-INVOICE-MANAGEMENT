import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '../contexts/UIContext'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useUI()

  const tabs = [
    { name: 'Create Invoice', path: '/invoices/create' },
    { name: 'All Invoices', path: '/invoices' },
    { name: 'Customers', path: '/customers' },
    { name: 'Dashboard', path: '/' },
    { name: 'Analytics', path: '/analytics' },
  ]

  const isTabActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Full Width */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg no-print">
        <div className="w-full px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">RAM CHINO PESAN ENGINEERING</h1>
              <p className="text-xs text-blue-100">Invoice Management System</p>
            </div>
            <div className="text-right text-xs text-blue-100">
              <p>22, RC GARDEN, UDAIYAMPALAYAM, CHINAVEDAMPATTI, CBE – 641049</p>
              <p>Phone: 98945 99693 | Email: ramchinopesanengineering@gmail.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Full Width */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 no-print">
        <div className="w-full px-8">
          <div className="flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isTabActive(tab.path)
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content - Full Width */}
      <main className="w-full px-8 py-6">
        {children}
      </main>

      {/* Toast Notifications */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-opacity duration-300 ${
            toast.type === 'success'
              ? 'bg-green-500'
              : toast.type === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
