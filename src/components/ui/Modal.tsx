import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** `lg` is wider on desktop and slides up from the bottom on phones. */
  size?: 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  // Rendered at the document root so a parent that creates its own stacking context or
  // containing block (a fixed header, a transformed sidebar) cannot trap or hide it.
  return createPortal(
    <div className={size === 'lg' ? 'fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4' : 'fixed inset-0 z-50 flex items-center justify-center p-4'}>
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={
          size === 'lg'
            ? 'relative bg-white shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl dark:bg-gray-900 dark:border dark:border-gray-700'
            : 'relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border dark:border-gray-700'
        }
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
