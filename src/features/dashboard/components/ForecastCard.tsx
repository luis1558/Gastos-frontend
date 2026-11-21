import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { formatCurrency } from '../../../utils/format'
import type { MonthForecast } from '../../../types/models'
import { useMonthForecast } from '../../reports/hooks'
import { BlockError } from './BlockError'

/** Month forecast as the dashboard reads it; `period_state` is optional until every backend sends it. */
export type DashboardForecast = MonthForecast & {
  period_state?: 'past' | 'current' | 'future'
}

const TITLE = 'Proyección de mes'

export function ForecastCard({ year, month }: { year: number; month: number }) {
  const { data, isError, refetch } = useMonthForecast(year, month)

  if (isError) return <BlockError title={TITLE} onRetry={() => refetch()} className="mb-6" />
  if (!data) return null

  const forecast: DashboardForecast = data

  if (forecast.period_state === 'future') {
    return (
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{TITLE}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">Aún no hay datos para este mes</p>
      </Card>
    )
  }

  const totalSpent = Number(forecast.total_spent)
  const totalIncome = Number(forecast.total_income)

  if (forecast.period_state === 'past') {
    const balance = totalIncome - totalSpent
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resumen del mes</h2>
          <Badge color="gray">Mes cerrado</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Ingresos</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalIncome)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Gastado</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Balance final</p>
            <p className={`font-semibold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const daysElapsed = Number(forecast.days_elapsed)
  const daysInMonth = Number(forecast.days_in_month)
  const projectedExpenses = Number(forecast.projected_expenses)
  const projectedBalance = Number(forecast.projected_balance)
  const pacePct = forecast.pace_pct === null ? null : Number(forecast.pace_pct)

  const monthPct = daysInMonth > 0 ? Math.round((daysElapsed / daysInMonth) * 100) : 0
  const spendPct = projectedExpenses > 0 ? Math.round((totalSpent / projectedExpenses) * 100) : 0
  const spendBarWidth = Math.min(spendPct, 100)

  let badge: string
  if (projectedBalance < 0) {
    badge = '🔴 Vas a pasarte'
  } else if (spendPct > monthPct + 10) {
    badge = '🟡 Ojo al ritmo'
  } else {
    badge = '🟢 En camino'
  }

  const spendBarColor = projectedBalance < 0
    ? 'bg-red-500'
    : spendPct > monthPct + 10
    ? 'bg-yellow-400'
    : 'bg-green-500'

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{TITLE}</h2>
        <span className="text-sm font-medium">{badge}</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Día {daysElapsed} de {daysInMonth}
          </p>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-400 h-2.5 rounded-full transition-all"
              style={{ width: `${monthPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{monthPct}% del mes</p>
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Gastado vs proyectado</p>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className={`${spendBarColor} h-2.5 rounded-full transition-all`}
              style={{ width: `${spendBarWidth}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
            <span>{formatCurrency(totalSpent)} gastado</span>
            <span>{formatCurrency(projectedExpenses)} proyectado</span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Balance proyectado al día {daysInMonth}:{' '}
            <span className={`font-semibold ${projectedBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(projectedBalance)}
            </span>
          </p>
          {pacePct !== null && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ritmo:{' '}
              {pacePct > 0
                ? `▲ ${Math.abs(pacePct)}% más rápido que el mes pasado`
                : `▼ ${Math.abs(pacePct)}% más lento que el mes pasado`}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
