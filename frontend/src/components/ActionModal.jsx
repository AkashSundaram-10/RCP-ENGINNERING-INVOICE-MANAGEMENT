import { useEffect, useRef } from 'react'

const intentStyles = {
  primary: {
    header: 'from-blue-600 to-blue-700',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700',
    ring: 'focus:ring-blue-500',
    border: 'border-blue-200',
  },
  danger: {
    header: 'from-red-600 to-red-700',
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700',
    ring: 'focus:ring-red-500',
    border: 'border-red-200',
  },
  warning: {
    header: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700',
    ring: 'focus:ring-amber-500',
    border: 'border-amber-200',
  },
  success: {
    header: 'from-emerald-600 to-emerald-700',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    ring: 'focus:ring-emerald-500',
    border: 'border-emerald-200',
  },
}

export default function ActionModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  intent = 'primary',
  inputLabel,
  inputPlaceholder,
  inputType = 'text',
  inputValue,
  onInputChange,
  helperText,
  error,
  onConfirm,
  onCancel,
}) {
  const inputRef = useRef(null)
  const styles = intentStyles[intent] || intentStyles.primary

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="modal w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
      >
        <div className={`bg-gradient-to-r ${styles.header} px-6 py-4 text-white`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <svg
                className={`h-5 w-5 ${styles.iconText}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11V7m0 8h.01M5.5 19h13a2 2 0 001.78-2.9l-6.5-12a2 2 0 00-3.56 0l-6.5 12A2 2 0 005.5 19z" />
              </svg>
            </div>
            <div>
              <h2 id="action-modal-title" className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="text-sm text-white/80">{description}</p>}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {inputLabel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{inputLabel}</label>
              <input
                ref={inputRef}
                type={inputType}
                value={inputValue}
                onChange={(event) => onInputChange?.(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    onConfirm?.()
                  }
                }}
                placeholder={inputPlaceholder}
                className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${styles.ring} ${styles.border}`}
              />
              {helperText && <p className="mt-2 text-xs text-gray-500">{helperText}</p>}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
