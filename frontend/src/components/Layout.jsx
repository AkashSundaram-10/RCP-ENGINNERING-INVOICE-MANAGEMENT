import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUI } from '../contexts/UIContext'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { toast } = useUI()

  const tabs = [
    { 
      name: 'Dashboard', 
      path: '/',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    },
    { 
      name: 'Create Invoice', 
      path: '/invoices/create',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    },
    { 
      name: 'All Invoices', 
      path: '/invoices',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    { 
      name: 'Customers', 
      path: '/customers',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    },
    { 
      name: 'Analytics', 
      path: '/analytics',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    },
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
            <div className="flex items-center gap-4">
              <img src="/images/logo.png" alt="RCP Logo" className="h-16 w-auto bg-white rounded-lg p-1.5 shadow-md" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">RAM CHINO PESAN ENGINEERING</h1>
                <p className="text-sm font-medium text-blue-200 mt-0.5">Invoice Management System</p>
              </div>
            </div>
            <div className="text-right text-sm text-blue-100 font-medium">
              <p>22, RC GARDEN, UDAIYAMPALAYAM, CHINAVEDAMPATTI, CBE – 641049</p>
              <p className="mt-0.5">Phone: 98945 99693 | Email: ramchinopesanengineering@gmail.com</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Full Width */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 no-print">
        <div className="w-full px-8 py-3">
          <div className="flex space-x-4 justify-center">
            {tabs.map((tab) => {
              const active = isTabActive(tab.path)
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg shadow-blue-900/30 transform -translate-y-0.5'
                      : 'bg-transparent text-gray-600 hover:bg-blue-50 hover:text-blue-800 hover:-translate-y-0.5 hover:shadow-sm border border-transparent hover:border-blue-100'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              )
            })}
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
