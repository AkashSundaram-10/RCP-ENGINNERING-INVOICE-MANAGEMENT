import { useState } from 'react'
import { useCustomers } from '../contexts/CustomerContext'

export default function Customers() {
  const { customers, loading, deleteCustomer, createCustomer, updateCustomer } = useCustomers()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    gstin: '',
    phone: '',
    email: '',
  })

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({ name: '', address: '', gstin: '', phone: '', email: '' })
    setShowModal(true)
  }

  const handleEditClick = (customer) => {
    setEditingId(customer.id)
    setFormData({
      name: customer.name,
      address: customer.address || '',
      gstin: customer.gstin || '',
      phone: customer.phone || '',
      email: customer.email || '',
    })
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateCustomer(editingId, formData)
      } else {
        await createCustomer(formData)
      }
      setShowModal(false)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id)
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <button
          onClick={handleAddClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Customer
        </button>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-500">No customers yet. Add your first customer!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-amber-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">GSTIN</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    {customer.address && (
                      <div className="text-xs text-gray-500">{customer.address.substring(0, 40)}...</div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{customer.gstin || '—'}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{customer.phone || '—'}</td>
                  <td className="px-6 py-3 text-sm space-x-2">
                    <button
                      onClick={() => handleEditClick(customer)}
                      className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="inline-block px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Customer' : 'Add New Customer'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Save Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
