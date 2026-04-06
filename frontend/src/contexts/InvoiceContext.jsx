import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUI } from './UIContext'

const InvoiceContext = createContext()

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useUI()

  const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

  // Load all invoices
  const loadInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/invoices`)
      if (!res.ok) throw new Error('Failed to load invoices')
      const data = await res.json()
      setInvoices(data)
    } catch (err) {
      setError(err.message)
      showToast('Failed to load invoices', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Load single invoice
  const loadInvoice = useCallback(async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`)
      if (!res.ok) throw new Error('Failed to load invoice')
      const data = await res.json()
      setSelectedInvoice(data)
    } catch (err) {
      setError(err.message)
      showToast('Failed to load invoice', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Create invoice
  const createInvoice = useCallback(async (invoiceData) => {
    setLoading(true)
    try {
      console.log('Creating invoice with data:', invoiceData)
      const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })
      
      const responseText = await res.text()
      console.log('Response status:', res.status)
      console.log('Response body:', responseText)
      
      if (!res.ok) {
        let errorMessage = 'Failed to create invoice'
        let suggestedNumber = null
        
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorMessage
          suggestedNumber = errorData.suggested_number
        } catch (e) {
          errorMessage = responseText || errorMessage
        }
        
        const error = new Error(errorMessage)
        error.suggestedNumber = suggestedNumber
        throw error
      }
      
      const newInvoice = JSON.parse(responseText)
      setInvoices(prev => [newInvoice, ...prev])
      showToast('Invoice created successfully', 'success')
      return newInvoice
    } catch (err) {
      console.error('Full error:', err)
      setError(err.message)
      
      if (err.suggestedNumber) {
        showToast(`${err.message}`, 'error')
        return { suggestedNumber: err.suggestedNumber }
      }
      
      showToast(`Failed to create invoice: ${err.message}`, 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast, API_URL])

  // Update invoice
  const updateInvoice = useCallback(async (id, invoiceData) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      })
      if (!res.ok) throw new Error('Failed to update invoice')
      const updated = await res.json()
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv))
      setSelectedInvoice(updated)
      showToast('Invoice updated successfully', 'success')
      return updated
    } catch (err) {
      setError(err.message)
      showToast('Failed to update invoice', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Delete invoice
  const deleteInvoice = useCallback(async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete invoice')
      setInvoices(prev => prev.filter(inv => inv.id !== id))
      showToast('Invoice deleted successfully', 'success')
    } catch (err) {
      setError(err.message)
      showToast('Failed to delete invoice', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Update payment status
  const updateInvoiceStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: status })
      })
      if (!res.ok) throw new Error('Failed to update status')
      const updated = await res.json()
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv))
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(updated)
      }
      showToast('Invoice status updated', 'success')
    } catch (err) {
      showToast('Failed to update status', 'error')
      throw err
    }
  }, [selectedInvoice, showToast])

  // Get next invoice number
  const getNextInvoiceNumber = useCallback(async (batch = null) => {
    try {
      const queryParam = batch ? `?batch=${encodeURIComponent(batch)}` : ''
      const res = await fetch(`${API_URL}/invoices/next-number${queryParam}`)
      if (!res.ok) throw new Error('Failed to get next invoice number')
      const data = await res.json()
      return data
    } catch (err) {
      showToast('Failed to get next invoice number', 'error')
      return { next_number: '001', current_batch: 'Batch 2' }
    }
  }, [showToast])

  // Get all batches
  const getBatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/invoices/batches`)
      if (!res.ok) throw new Error('Failed to get batches')
      const data = await res.json()
      return data
    } catch (err) {
      showToast('Failed to get batches', 'error')
      return []
    }
  }, [showToast])

  // Load invoices on mount
  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  const value = {
    invoices,
    selectedInvoice,
    loading,
    error,
    loadInvoices,
    loadInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    getNextInvoiceNumber,
    getBatches,
  }

  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  )
}

export function useInvoices() {
  const context = useContext(InvoiceContext)
  if (!context) {
    throw new Error('useInvoices must be used within InvoiceProvider')
  }
  return context
}
