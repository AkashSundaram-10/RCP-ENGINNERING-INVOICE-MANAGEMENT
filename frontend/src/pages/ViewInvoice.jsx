import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInvoices } from '../contexts/InvoiceContext'
import { useCustomers } from '../contexts/CustomerContext'
import './InvoiceTemplate.css'

export default function ViewInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedInvoice, loadInvoice, updateInvoice, deleteInvoice } = useInvoices()
  const { searchCustomers } = useCustomers()

  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  // Password for edit actions
  const checkPassword = () => {
    const password = prompt('Enter password:')
    if (password !== '1981') {
      alert('Incorrect password!')
      return false
    }
    return true
  }

  // Confirmation for delete action
  const checkDeleteConfirmation = () => {
    const confirmation = prompt('Type "DELETE" to continue:')
    if (confirmation !== 'DELETE') {
      alert('Incorrect! You must type DELETE to proceed.')
      return false
    }
    return true
  }

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true)
      await loadInvoice(id)
      setLoading(false)
    }
    fetchInvoice()
  }, [id, loadInvoice])

  // Convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

    const convertHundreds = (n) => {
      if (n === 0) return ''
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertHundreds(n % 100) : '')
    }

    const convertThousands = (n) => {
      if (n < 1000) return convertHundreds(n)
      if (n < 100000) {
        const thousands = Math.floor(n / 1000)
        const remainder = n % 1000
        return convertHundreds(thousands) + ' Thousand' + (remainder ? ' ' + convertHundreds(remainder) : '')
      }
      if (n < 10000000) {
        const lakhs = Math.floor(n / 100000)
        const remainder = n % 100000
        return convertHundreds(lakhs) + ' Lakh' + (remainder ? ' ' + convertThousands(remainder) : '')
      }
      const crores = Math.floor(n / 10000000)
      const remainder = n % 10000000
      return convertHundreds(crores) + ' Crore' + (remainder ? ' ' + convertThousands(remainder) : '')
    }

    if (num === 0) return 'Zero'
    return convertThousands(num) + ' Only'
  }

  const handleDelete = async () => {
    if (!checkDeleteConfirmation()) return
    
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id)
        navigate('/invoices')
      } catch (err) {
        console.error('Error deleting invoice:', err)
      }
    }
  }

  const handleEdit = () => {
    if (!checkPassword()) return
    setIsEditing(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading invoice...</div>
      </div>
    )
  }

  if (!selectedInvoice) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">Invoice not found</div>
      </div>
    )
  }

  const invoice = selectedInvoice

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Action Bar - Enhanced with glassmorphism effect */}
      <div className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/invoices')}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Invoice #{invoice.invoice_no}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                invoice.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {invoice.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Invoice
              </button>
              
              <button
                onClick={() => window.print()}
                className="group px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print / Download
              </button>
              
              <button
                onClick={handleDelete}
                className="group px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-medium shadow-lg shadow-red-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Container - Professional A4 Template */}
      <div className="invoice-preview-wrapper max-w-4xl mx-auto px-6 py-8">
        <div className="invoice">
          {/* Top Accent Stripe */}
          <div className="top-stripe"></div>

          {/* Header: Company + Invoice Title */}
          <div className="invoice-header">
            <div className="company-block">
              <div className="company-header-with-logo">
                <img src="/images/logo.png" alt="RCP Logo" className="company-logo" />
                <div className="company-info">
                  <div className="company-name">Ram Chino Pesan Engineering</div>
                  <div className="company-sub">
                    <span>📍 22, RC Garden, Udaiyampalayam, Chinavedampatti, CBE – 641049</span><br />
                    <span>📞 98945 99693</span>
                    <span>✉ ramchinopesanengineering@gmail.com</span>
                    <span className="gstin">🏢 GSTIN: 33PNHPS2266B1ZT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="invoice-title-block">
              <div className="invoice-title">TAX<br />INVOICE</div>
              <div className="invoice-no-box">
                <div className="label">Invoice No.</div>
                <div className="value">{invoice.invoice_no}</div>
              </div>
            </div>
          </div>

          {/* Bill To + Date */}
          <div className="meta-row">
            <div className="bill-to">
              <div className="meta-label">Bill To</div>
              <div className="customer-name">{invoice.customer_name}</div>
              <div className="customer-addr">{invoice.customer_address || 'Address'}</div>
              <div className="customer-gstin">GSTIN: {invoice.customer_gstin || '—'}</div>
            </div>

            <div className="date-block">
              <div className="date-box">
                <div className="label">Invoice Date</div>
                <div className="date-val">{invoice.date}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="table-section">
            <table className="items-table">
              <thead>
                <tr>
                  <th style={{width: '30px'}}>#</th>
                  <th>Description</th>
                  <th style={{width: '80px'}} className="center">HSN / SAC</th>
                  <th style={{width: '50px'}} className="center">Qty</th>
                  <th style={{width: '80px'}} className="right">Rate (₹)</th>
                  <th style={{width: '90px'}} className="right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => {
                  const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)
                  return (
                    <tr key={idx}>
                      <td className="center">{idx + 1}</td>
                      <td>{item.description}</td>
                      <td className="center">{item.hsn_code}</td>
                      <td className="center">{item.qty}</td>
                      <td className="right">{parseFloat(item.rate).toFixed(2)}</td>
                      <td className="right">{amount.toFixed(2)}</td>
                    </tr>
                  )
                })}
                {/* Very big description box - 25 rows total */}
                {Array.from({ length: Math.max(0, 25 - (invoice.items?.length || 0)) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="empty-row">
                    <td></td><td></td><td></td><td></td><td></td><td></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals-wrapper">
              <table className="totals-table">
                <tbody>
                  <tr><td>Subtotal</td><td>₹ {(invoice.subtotal || 0).toFixed(2)}</td></tr>
                  <tr><td>SGST (9%)</td><td>₹ {(invoice.sgst || 0).toFixed(2)}</td></tr>
                  <tr><td>CGST (9%)</td><td>₹ {(invoice.cgst || 0).toFixed(2)}</td></tr>
                  <tr className="grand"><td>Grand Total</td><td>₹ {(invoice.grand_total || 0).toFixed(2)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="amount-words">
            Amount in Words: <span>Rupees {numberToWords(Math.floor(invoice.grand_total || 0))}</span>
          </div>

          {/* Bank Details + Terms & Conditions */}
          <div className="bank-terms-section">
            <div className="bank-details">
              <div className="section-head">Bank Details</div>
              <table>
                <tbody>
                  <tr><td>Bank</td><td>: Bank of Baroda</td></tr>
                  <tr><td>A/C No.</td><td>: 35540200001592</td></tr>
                  <tr><td>IFSC</td><td>: BARB0GANAPA <em style={{fontSize: '9px', color: '#777'}}>(5th letter zero)</em></td></tr>
                  <tr><td>Branch</td><td>: Ganapathy</td></tr>
                </tbody>
              </table>
            </div>

            <div className="terms">
              <div className="section-head">Terms & Conditions</div>
              <ol>
                <li>Goods once sold will not be taken back.</li>
                <li>50% advance before commencing work.</li>
                <li>Buyer must verify quantity and quality at the time of delivery.</li>
                <li>Balance payment must be made within the agreed time from the date of invoice.</li>
              </ol>
            </div>
          </div>

          {/* Footer Section */}
          <div className="footer-section">
            <div className="footer-left">
              <div>Thank you for your business!</div>
              <div>For queries: 98945 99693</div>
            </div>
            
            <div className="signatory">
              <div className="for-text">For: RAM CHINO PESAN ENGINEERING</div>
              <div className="sig-line">Authorized Signatory</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
