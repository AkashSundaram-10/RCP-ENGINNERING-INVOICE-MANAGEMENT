import { createContext, useContext, useState, useCallback } from 'react'

const UIContext = createContext()

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), duration)
  }, [])

  const value = {
    toast,
    showToast,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within UIProvider')
  }
  return context
}
