import { useEffect, useRef, useState } from 'react'
import { FiArrowDownRight, FiCalendar, FiCreditCard, FiEdit2, FiMoreVertical, FiTag, FiTrash2 } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { classNames, formatCurrency, formatDate } from '../../../utils/format'
import type { Expense } from '../../../types/models'

// Menu height (4 items) plus the fixed bottom navigation bar and some breathing room.
const MENU_SPACE_NEEDED = 340

interface ExpenseRowProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onChangeCategory: (expense: Expense) => void
  onMove: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export function ExpenseRow({ expense, onEdit, onChangeCategory, onMove, onDelete }: ExpenseRowProps) {
  const actions = [
    { label: 'Editar', icon: FiEdit2, run: onEdit, hover: 'hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' },
    { label: 'Cambiar categoría', icon: FiTag, run: onChangeCategory, hover: 'hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30' },
    { label: 'Mover a otro período', icon: FiCalendar, run: onMove, hover: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30' },
    { label: 'Eliminar', icon: FiTrash2, run: onDelete, hover: 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30' },
  ]

  return (
    <Card padding={false} className="p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          title="Gasto"
        >
          <FiArrowDownRight size={20} aria-hidden="true" />
        </span>

        {/* Phones: description, then details, then the amount. Wide screens: amount on the right. */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="line-clamp-2 break-words font-medium text-gray-900 dark:text-gray-100">{expense.description}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <span>{expense.category_name || expense.category_slug}</span>
              {expense.card_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  <FiCreditCard size={12} aria-hidden="true" /> {expense.card_name}
                </span>
              )}
              <span className="text-gray-400 dark:text-gray-500">· {formatDate(expense.expense_date)}</span>
            </div>
          </div>
          <p className="shrink-0 text-lg font-semibold text-red-600 sm:text-base dark:text-red-400">
            <span className="sr-only">Gasto de </span>−{formatCurrency(Number(expense.amount))}
          </p>
        </div>

        {/* Wide screens keep the quick icons; phones get a single menu so the text keeps its room. */}
        <div className="hidden shrink-0 items-center sm:flex">
          {actions.map(({ label, icon: Icon, run, hover }) => (
            <button
              key={label}
              type="button"
              onClick={() => run(expense)}
              title={label}
              aria-label={label}
              className={classNames('rounded-lg p-2 text-gray-400 transition-colors', hover)}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <ActionsMenu actions={actions} expense={expense} />
      </div>
    </Card>
  )
}

interface ActionsMenuProps {
  actions: { label: string; icon: typeof FiEdit2; run: (expense: Expense) => void }[]
  expense: Expense
}

function ActionsMenu({ actions, expense }: ActionsMenuProps) {
  const [open, setOpen] = useState(false)
  // Open upwards near the bottom of the screen, where the menu would hide under the navigation bar.
  const [dropUp, setDropUp] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative -mr-2 -mt-1 shrink-0 sm:hidden">
      <button
        type="button"
        aria-label={`Acciones de ${expense.description}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          setDropUp(window.innerHeight - rect.bottom < MENU_SPACE_NEEDED)
          setOpen((value) => !value)
        }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        <FiMoreVertical size={18} />
      </button>
      {open && (
        <div
          role="menu"
          className={classNames(
            'absolute right-0 z-20 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          {actions.map(({ label, icon: Icon, run }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                run(expense)
              }}
              className={classNames(
                'flex min-h-11 w-full items-center gap-3 px-4 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800',
                label === 'Eliminar' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
              )}
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
