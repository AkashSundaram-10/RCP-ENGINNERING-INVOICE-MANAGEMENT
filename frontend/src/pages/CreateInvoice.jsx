import { useState, useEffect } from 'react'
import { useInvoices } from '../contexts/InvoiceContext'
import { useCustomers } from '../contexts/CustomerContext'
import { useNavigate } from 'react-router-dom'
import './InvoiceTemplate.css'

// Password for all operations
const ADMIN_PASSWORD = '1981'

// Check password function
const checkPassword = () => {
  const pwd = prompt('Enter admin password to create invoice:')
  if (pwd !== ADMIN_PASSWORD) {
    alert('Incorrect password!')
    return false
  }
  return true
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const { createInvoice, getNextInvoiceNumber, getBatches } = useInvoices()
  const { customers, searchCustomers } = useCustomers()
  
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check password on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      if (checkPassword()) {
        setIsAuthenticated(true)
      } else {
        navigate('/invoices')
      }
    }
  }, [])

  const [invoiceNo, setInvoiceNo] = useState('')
  const [currentBatch, setCurrentBatch] = useState('2025-2026')
  const [availableBatches, setAvailableBatches] = useState(['2025-2026', '2026-2027'])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Determine batch based on date
  // Batch 1 (2025-2026): July 2, 2025 to March 31, 2026
  // Batch 2 (2026-2027): April 1, 2026 to March 31, 2027
  // And so on...
  const getBatchForDate = (dateStr) => {
    const d = new Date(dateStr)
    const month = d.getMonth() + 1 // 1-12
    const year = d.getFullYear()
    
    // Financial year starts April 1 (but for first batch starting July 2, 2025)
    // If date is before April, it belongs to previous financial year
    if (month >= 4) {
      // April onwards - belongs to current year FY
      return `${year}-${year + 1}`
    } else {
      // Jan-March - belongs to previous year FY
      return `${year - 1}-${year}`
    }
  }

  // Update batch when date changes
  useEffect(() => {
    const batch = getBatchForDate(date)
    setCurrentBatch(batch)
  }, [date])
  const [customerId, setCustomerId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerGstin, setCustomerGstin] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [items, setItems] = useState([{ description: '', hsn_code: '998898', qty: 1, rate: 0 }])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState([])

  // Load next invoice number on mount and when batch changes
  useEffect(() => {
    const loadData = async () => {
      // Load next number for current batch
      const data = await getNextInvoiceNumber(currentBatch)
      setInvoiceNo(data.next_number || '001')
    }
    if (currentBatch) {
      loadData()
    }
  }, [getNextInvoiceNumber, currentBatch])

  // Handle customer search
  const handleCustomerSearch = async (value) => {
    setCustomerName(value)
    if (value.length >= 2) {
      const results = await searchCustomers(value)
      setFilteredCustomers(results)
      setShowCustomerDropdown(true)
    } else {
      setShowCustomerDropdown(false)
    }
  }

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    setCustomerId(customer.id)
    setCustomerName(customer.name)
    setCustomerAddress(customer.address || '')
    setCustomerGstin(customer.gstin || '')
    setCustomerPhone(customer.phone || '')
    setShowCustomerDropdown(false)
  }

  // Handle line item change
  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  // Add line item
  const addItem = () => {
    setItems([...items, { description: '', hsn_code: '998898', qty: 1, rate: 0 }])
  }

  // Delete line item
  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)
      return sum + amount
    }, 0)

    const tax = subtotal * 0.09 // 9% SGST
    const sgst = tax
    const cgst = tax
    const grandTotal = subtotal + sgst + cgst

    return { subtotal, sgst, cgst, grandTotal }
  }

  const totals = calculateTotals()

  // Handle save
  const handleSave = async () => {
    if (!customerName || items.length === 0) {
      alert('Please enter customer name and at least one item')
      return
    }

    // Filter items with description, qty, and rate
    const validItems = items.filter(item => item.description && item.qty && item.rate)
    
    if (validItems.length === 0) {
      alert('Please add at least one item with description, quantity, and rate')
      return
    }

    const invoiceData = {
      invoice_no: invoiceNo,
      batch: currentBatch,
      date,
      customer_id: customerId || null,
      customer_name: customerName,
      customer_address: customerAddress,
      customer_gstin: customerGstin,
      customer_phone: customerPhone,
      subtotal: totals.subtotal,
      sgst: totals.sgst,
      cgst: totals.cgst,
      grand_total: totals.grandTotal,
      items: validItems,
    }

    try {
      console.log('Saving invoice:', invoiceData)
      const result = await createInvoice(invoiceData)
      
      if (result?.suggestedNumber) {
        const useSuggested = confirm(`Invoice number ${invoiceNo} already exists. Would you like to use ${result.suggestedNumber} instead?`)
        if (useSuggested) {
          setInvoiceNo(result.suggestedNumber)
          return // Don't navigate, let user save with new number
        }
        return
      }
      
      alert('Invoice saved successfully!')
      navigate('/invoices')
    } catch (err) {
      console.error('Error saving invoice:', err)
      alert(`Failed to create invoice: ${err.message || 'Unknown error'}`)
    }
  }

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

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Authenticating...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-invoice-page">
      {/* Form Section (Left) */}
      <div className="space-y-6 no-print">
        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Invoice & Batch Details</h3>
          
          {/* Batch Selector */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Financial Year Batch
            </label>
            <div className="flex items-center gap-3">
              <select
                value={currentBatch}
                onChange={(e) => setCurrentBatch(e.target.value)}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              >
                <option value="2025-2026">2025-2026 (FY Apr 2025 - Mar 2026)</option>
                <option value="2026-2027">2026-2027 (FY Apr 2026 - Mar 2027)</option>
              </select>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 Batch auto-selected based on invoice date
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No.</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={e => setInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Next available: {invoiceNo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Customer Details</h3>
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={e => handleCustomerSearch(e.target.value)}
                onFocus={() => filteredCustomers.length > 0 && setShowCustomerDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search customer..."
              />
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {filteredCustomers.map(cust => (
                    <button
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex justify-between"
                    >
                      <span>{cust.name}</span>
                      <span className="text-gray-500 text-sm">{cust.gstin}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={customerGstin}
                onChange={e => setCustomerGstin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Line Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-100 rounded">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Description</th>
                  <th className="px-3 py-2 text-left font-semibold">HSN</th>
                  <th className="px-3 py-2 text-center font-semibold">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold">Rate</th>
                  <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th className="px-3 py-2 text-center w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)
                  return (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="px-3 py-2">
                        <textarea
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          rows="2"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.hsn_code}
                          onChange={e => handleItemChange(idx, 'hsn_code', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={e => handleItemChange(idx, 'qty', e.target.value)}
                          min="1"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-blue-900">{amount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => deleteItem(idx)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={addItem}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 font-medium text-sm"
          >
            + Add Item
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save Invoice
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Print / Download
          </button>
          <button
            onClick={() => {
              setInvoiceNo('')
              setDate(new Date().toISOString().split('T')[0])
              setCustomerName('')
              setCustomerAddress('')
              setCustomerGstin('')
              setCustomerPhone('')
              setItems([{ description: '', hsn_code: '998898', qty: 1, rate: 0 }])
            }}
            className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Preview Section (Right) - Professional A4 Template */}
      <div className="invoice-preview-wrapper sticky top-20">
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
                <div className="value">{invoiceNo || '—'}</div>
              </div>
            </div>
          </div>

          {/* Bill To + Date */}
          <div className="meta-row">
            <div className="bill-to">
              <div className="meta-label">Bill To</div>
              <div className="customer-name">{customerName || 'Customer Name'}</div>
              <div className="customer-addr">{customerAddress || 'Address'}</div>
              <div className="customer-gstin">GSTIN: {customerGstin || '—'}</div>
            </div>

            <div className="date-block">
              <div className="date-box">
                <div className="label">Invoice Date</div>
                <div className="date-val">{new Date(date).toLocaleDateString('en-IN')}</div>
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
                {items.map((item, idx) => {
                  const amount = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)
                  return (
                    <tr key={idx}>
                      <td className="center">{idx + 1}</td>
                      <td>{item.description || '—'}</td>
                      <td className="center">{item.hsn_code}</td>
                      <td className="center">{item.qty}</td>
                      <td className="right">{parseFloat(item.rate || 0).toFixed(2)}</td>
                      <td className="right">{amount.toFixed(2)}</td>
                    </tr>
                  )
                })}
                {/* Very big description box - 25 rows total */}
                {Array.from({ length: Math.max(0, 25 - items.length) }).map((_, idx) => (
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
                  <tr><td>Subtotal</td><td>₹ {totals.subtotal.toFixed(2)}</td></tr>
                  <tr><td>SGST (9%)</td><td>₹ {totals.sgst.toFixed(2)}</td></tr>
                  <tr><td>CGST (9%)</td><td>₹ {totals.cgst.toFixed(2)}</td></tr>
                  <tr className="grand"><td>Grand Total</td><td>₹ {totals.grandTotal.toFixed(2)}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="amount-words">
            Amount in Words: <span>Rupees {numberToWords(Math.floor(totals.grandTotal))}</span>
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
