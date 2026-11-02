import { Link } from 'react-router-dom'
import { FiTarget, FiArrowRight } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/format'
import { ROUTES } from '../../../utils/constants'
import { useGoalOverview } from '../hooks'

/** Spendable money right now: everything you have minus what is set aside in goals. */
export function AvailableCard() {
  const { data: overview } = useGoalOverview()
  if (!overview) return null

  const available = Number(overview.available)
  const reserved = Number(overview.reserved)

  return (
    <Link to={ROUTES.GOALS} className="mb-6 block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl">
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl dark:bg-indigo-900/30">
            <FiTarget size={24} className="text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">Disponible para gastar</p>
            <p className={`text-2xl font-bold ${available >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-600'}`}>
              {formatCurrency(available)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {reserved > 0
                ? `Saldo total ${formatCurrency(Number(overview.balance))} · ${formatCurrency(reserved)} apartado en metas`
                : 'Aún no tienes dinero apartado en metas'}
            </p>
          </div>
          <FiArrowRight size={18} className="shrink-0 text-gray-300 dark:text-gray-600" aria-hidden="true" />
        </div>
      </Card>
    </Link>
  )
}
