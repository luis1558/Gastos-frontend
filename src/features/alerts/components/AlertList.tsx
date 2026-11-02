import { Link } from 'react-router-dom'
import { formatCurrency, formatDate, classNames } from '../../../utils/format'
import { ROUTES } from '../../../utils/constants'
import type { AlertItem } from '../../../types/models'
import { AlertIcon } from './AlertIcon'
import { describeDue, dueToneClass } from './alertText'

function routeFor(item: AlertItem): string {
  switch (item.kind) {
    case 'debt':
      return ROUTES.DEBT_DETAIL(item.entity_id)
    case 'goal':
      return ROUTES.GOAL_DETAIL(item.entity_id)
    case 'card':
      return ROUTES.CARDS
    default:
      return ROUTES.FIXED_PAYMENTS
  }
}

interface AlertListProps {
  items: AlertItem[]
  /** Called after a row is followed, e.g. to close the panel that contains the list. */
  onNavigate?: () => void
}

export function AlertList({ items, onNavigate }: AlertListProps) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={routeFor(item)}
            onClick={onNavigate}
            className="flex min-h-14 items-start gap-3 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <AlertIcon kind={item.kind} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 break-words text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</p>
              <p className={classNames('text-sm', dueToneClass[item.severity])}>
                {describeDue(item)} · {formatDate(item.due_date)}
              </p>
              {item.detail && <p className="text-xs text-gray-500 dark:text-gray-400">{item.detail}</p>}
              {item.saved_amount != null && Number(item.saved_amount) > 0 && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  {item.kind === 'goal' ? 'Apartado' : 'Ya apartaste'} {formatCurrency(Number(item.saved_amount))}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {item.amount != null ? (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(item.amount))}</p>
                  {item.kind === 'goal' && <p className="text-xs text-gray-500 dark:text-gray-400">te falta</p>}
                </>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">Monto por definir</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
