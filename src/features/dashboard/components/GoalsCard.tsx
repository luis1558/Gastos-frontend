import { Link } from 'react-router-dom'
import { Card } from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/format'
import { ROUTES } from '../../../utils/constants'
import { useGoals } from '../../goals/hooks'
import { BlockError } from './BlockError'

const TITLE = 'Metas'

export function GoalsCard() {
  const { data, isError, refetch } = useGoals('active')

  if (isError) return <BlockError title={TITLE} onRetry={() => refetch()} />
  if (!data) return null

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{TITLE}</h2>
        <Link to={ROUTES.GOALS} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          Ver metas
        </Link>
      </div>
      {data.length > 0 ? (
        <div className="space-y-3">
          {data.map((goal) => {
            const saved = Number(goal.saved_amount)
            const target = Number(goal.target_amount)
            const pct = target > 0 ? Math.round((saved / target) * 100) : 0
            return (
              <Link key={goal.id} to={ROUTES.GOAL_DETAIL(goal.id)} className="block">
                <div className="flex justify-between text-sm mb-1 gap-2">
                  <span className="text-gray-700 dark:text-gray-300 truncate">{goal.name}</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium shrink-0">
                    {formatCurrency(saved)} / {formatCurrency(target)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${pct >= 100 ? 'bg-green-500' : 'bg-indigo-500'} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{pct}%</p>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">No tienes metas activas</p>
      )}
    </Card>
  )
}
