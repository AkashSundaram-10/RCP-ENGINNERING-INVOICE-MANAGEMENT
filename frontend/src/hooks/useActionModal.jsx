import { useCallback, useRef, useState } from 'react'
import ActionModal from '../components/ActionModal'
import { ADMIN_PASSWORD } from '../constants/security'

const baseModal = {
  open: false,
  kind: 'confirm',
  title: '',
  description: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  intent: 'primary',
  inputLabel: null,
  inputPlaceholder: '',
  inputType: 'text',
  helperText: '',
}

export function useActionModal() {
  const [modal, setModal] = useState(baseModal)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const confirmRef = useRef(null)
  const cancelRef = useRef(null)

  const openModal = useCallback((config, onConfirm, onCancel) => {
    confirmRef.current = onConfirm || null
    cancelRef.current = onCancel || null
    setInputValue('')
    setError('')
    setModal({ ...baseModal, ...config, open: true })
  }, [])

  const requestPassword = useCallback(
    (onConfirm, options = {}) => {
      openModal(
        {
          kind: 'password',
          title: options.title || 'Admin Access',
          description: options.description || 'Enter the admin password to continue.',
          confirmText: options.confirmText || 'Unlock',
          cancelText: options.cancelText || 'Cancel',
          intent: options.intent || 'primary',
          inputLabel: options.inputLabel || 'Password',
          inputPlaceholder: options.inputPlaceholder || 'Enter password',
          inputType: 'password',
          helperText: options.helperText || 'Only authorized staff can proceed.',
        },
        onConfirm,
        options.onCancel
      )
    },
    [openModal]
  )

  const requestDeleteConfirm = useCallback(
    (onConfirm, options = {}) => {
      openModal(
        {
          kind: 'delete',
          title: options.title || 'Confirm Deletion',
          description: options.description || 'This action cannot be undone.',
          confirmText: options.confirmText || 'Delete',
          cancelText: options.cancelText || 'Cancel',
          intent: options.intent || 'danger',
          inputLabel: options.inputLabel || 'Type DELETE to confirm',
          inputPlaceholder: options.inputPlaceholder || 'DELETE',
          inputType: 'text',
          helperText: options.helperText || 'Please type DELETE exactly to proceed.',
        },
        onConfirm,
        options.onCancel
      )
    },
    [openModal]
  )

  const requestConfirm = useCallback(
    (onConfirm, options = {}) => {
      openModal(
        {
          kind: 'confirm',
          title: options.title || 'Please Confirm',
          description: options.description || '',
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          intent: options.intent || 'warning',
          inputLabel: null,
          inputPlaceholder: '',
          inputType: 'text',
          helperText: options.helperText || '',
        },
        onConfirm,
        options.onCancel
      )
    },
    [openModal]
  )

  const handleInputChange = useCallback((value) => {
    setInputValue(value)
    if (error) setError('')
  }, [error])

  const handleCancel = useCallback(() => {
    setModal((prev) => ({ ...prev, open: false }))
    setInputValue('')
    setError('')
    const cancel = cancelRef.current
    confirmRef.current = null
    cancelRef.current = null
    if (cancel) cancel()
  }, [])

  const handleConfirm = useCallback(() => {
    if (modal.kind === 'password') {
      if (inputValue !== ADMIN_PASSWORD) {
        setError('Incorrect password. Please try again.')
        return
      }
    }

    if (modal.kind === 'delete') {
      if (inputValue.trim() !== 'DELETE') {
        setError('Please type DELETE to proceed.')
        return
      }
    }

    setModal((prev) => ({ ...prev, open: false }))
    setInputValue('')
    setError('')
    const confirm = confirmRef.current
    confirmRef.current = null
    cancelRef.current = null
    if (confirm) confirm()
  }, [inputValue, modal.kind])

  const modalElement = (
    <ActionModal
      open={modal.open}
      title={modal.title}
      description={modal.description}
      confirmText={modal.confirmText}
      cancelText={modal.cancelText}
      intent={modal.intent}
      inputLabel={modal.inputLabel}
      inputPlaceholder={modal.inputPlaceholder}
      inputType={modal.inputType}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      helperText={modal.helperText}
      error={error}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return {
    requestPassword,
    requestDeleteConfirm,
    requestConfirm,
    modalElement,
  }
}
