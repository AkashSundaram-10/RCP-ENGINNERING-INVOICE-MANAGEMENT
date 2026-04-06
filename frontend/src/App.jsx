import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AllInvoices from './pages/AllInvoices'
import CreateInvoice from './pages/CreateInvoice'
import ViewInvoice from './pages/ViewInvoice'
import Customers from './pages/Customers'
import Analytics from './pages/Analytics'

import { InvoiceProvider } from './contexts/InvoiceContext'
import { CustomerProvider } from './contexts/CustomerContext'
import { UIProvider } from './contexts/UIContext'

function App() {
  return (
    <Router>
      <UIProvider>
        <InvoiceProvider>
          <CustomerProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/invoices" element={<AllInvoices />} />
                <Route path="/invoices/create" element={<CreateInvoice />} />
                <Route path="/invoices/:id" element={<ViewInvoice />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/analytics" element={<Analytics />} />

              </Routes>
            </Layout>
          </CustomerProvider>
        </InvoiceProvider>
      </UIProvider>
    </Router>
  )
}

export default App
