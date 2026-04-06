import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useUI } from './UIContext'

const CustomerContext = createContext()

export function CustomerProvider({ children }) {
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showToast } = useUI()

  const API_URL = import.meta.env.VITE_API_BASE_URL || '/api'

  // Load all customers
  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/customers`)
      if (!res.ok) throw new Error('Failed to load customers')
      const data = await res.json()
      setCustomers(data)
    } catch (err) {
      setError(err.message)
      showToast('Failed to load customers', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Load single customer
  const loadCustomer = useCallback(async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/customers/${id}`)
      if (!res.ok) throw new Error('Failed to load customer')
      const data = await res.json()
      setSelectedCustomer(data)
    } catch (err) {
      setError(err.message)
      showToast('Failed to load customer', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Create customer
  const createCustomer = useCallback(async (customerData) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })
      if (!res.ok) throw new Error('Failed to create customer')
      const newCustomer = await res.json()
      setCustomers(prev => [newCustomer, ...prev])
      showToast('Customer created successfully', 'success')
      return newCustomer
    } catch (err) {
      setError(err.message)
      showToast('Failed to create customer', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Update customer
  const updateCustomer = useCallback(async (id, customerData) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      })
      if (!res.ok) throw new Error('Failed to update customer')
      const updated = await res.json()
      setCustomers(prev => prev.map(cust => cust.id === id ? updated : cust))
      setSelectedCustomer(updated)
      showToast('Customer updated successfully', 'success')
      return updated
    } catch (err) {
      setError(err.message)
      showToast('Failed to update customer', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete customer')
      setCustomers(prev => prev.filter(cust => cust.id !== id))
      showToast('Customer deleted successfully', 'success')
    } catch (err) {
      setError(err.message)
      showToast('Failed to delete customer', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Merge duplicate customers
  const mergeCustomers = useCallback(async (keepId, deleteIds) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/customers/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keepId, deleteIds })
      })
      if (!res.ok) throw new Error('Failed to merge customers')
      await loadCustomers() // Reload the list
      showToast('Customers merged successfully', 'success')
    } catch (err) {
      setError(err.message)
      showToast('Failed to merge customers', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [showToast, loadCustomers])

  // Search customers
  const searchCustomers = useCallback(async (query) => {
    if (!query.trim()) {
      return []
    }
    try {
      const res = await fetch(`${API_URL}/customers/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      return data
    } catch (err) {
      showToast('Search failed', 'error')
      return []
    }
  }, [showToast])

  // Load customers on mount
  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const value = {
    customers,
    selectedCustomer,
    loading,
    error,
    loadCustomers,
    loadCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    mergeCustomers,
    searchCustomers,
  }

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const context = useContext(CustomerContext)
  if (!context) {
    throw new Error('useCustomers must be used within CustomerProvider')
  }
  return context
}
