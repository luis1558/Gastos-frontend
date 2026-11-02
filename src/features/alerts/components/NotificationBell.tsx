import { useState } from 'react'
import { FiBell } from 'react-icons/fi'
import { classNames } from '../../../utils/format'
import { useAlerts } from '../hooks'
import { AlertsPanel } from './AlertsPanel'

interface NotificationBellProps {
  /** `icon` is the compact button of the phone header; `sidebar` looks like a menu entry. */
  variant?: 'icon' | 'sidebar'
}

export function NotificationBell({ variant = 'icon' }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const { data } = useAlerts()
  const total = data?.total ?? 0
  const hasOverdue = (data?.overdue ?? 0) > 0

  const badge =
    total > 0 ? (
      <span
        aria-hidden="true"
        className={classNames(
          'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold text-white',
          hasOverdue ? 'bg-red-600' : 'bg-amber-500',
          variant === 'icon' && 'absolute -right-0.5 -top-0.5',
        )}
      >
        {total > 9 ? '9+' : total}
      </span>
    ) : null

  const label = total > 0 ? `Avisos: ${total} ${total === 1 ? 'pendiente' : 'pendientes'}` : 'Avisos: todo al día'

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <FiBell size={22} />
          {badge}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={label}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <FiBell size={20} />
          <span className="flex-1 text-left">Avisos</span>
          {badge}
        </button>
      )}
      <AlertsPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
