import { useMonthlySummary } from '../hooks'
import { useMonthForecast, useRecurringExpenses } from '../../reports/hooks'
import { Card } from '../../../components/ui/Card'
import { Loading } from '../../../components/ui/Loading'
import { formatCurrency, formatMonthYear, getCurrentYear, getCurrentMonth } from '../../../utils/format'
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi'
import { useState } from 'react'
import { MONTH_NAMES } from '../../../utils/constants'

export function DashboardPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [month, setMonth] = useState(getCurrentMonth())
  const { data, isLoading } = useMonthlySummary(year, month)
  const { data: forecast } = useMonthForecast(year, month)
  const { data: recurring } = useRecurringExpenses()

  if (isLoading) return <Loading />

  const summary = data

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            {MONTH_NAMES.slice(1).map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl dark:bg-green-900/30">
                  <FiTrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summary.total_income)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-xl dark:bg-red-900/30">
                  <FiTrendingDown size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gastos</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(summary.total_expenses)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl dark:bg-indigo-900/30">
                  <FiDollarSign size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                  <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {forecast && (() => {
            const monthPct = Math.round((forecast.days_elapsed / forecast.days_in_month) * 100)
            const spendPct = forecast.projected_expenses > 0
              ? Math.round((forecast.total_spent / forecast.projected_expenses) * 100)
              : 0
            const spendBarWidth = Math.min(spendPct, 100)

            let badge: string
            if (forecast.projected_balance < 0) {
              badge = '🔴 Vas a pasarte'
            } else if (spendPct > monthPct + 10) {
              badge = '🟡 Ojo al ritmo'
            } else {
              badge = '🟢 En camino'
            }

            const spendBarColor = forecast.projected_balance < 0
              ? 'bg-red-500'
              : spendPct > monthPct + 10
              ? 'bg-yellow-400'
              : 'bg-green-500'

            return (
              <Card className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Proyección de mes</h2>
                  <span className="text-sm font-medium">{badge}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Día {forecast.days_elapsed} de {forecast.days_in_month}
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
                      <span>{formatCurrency(forecast.total_spent)} gastado</span>
                      <span>{formatCurrency(forecast.projected_expenses)} proyectado</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Balance proyectado al día {forecast.days_in_month}:{' '}
                      <span className={`font-semibold ${forecast.projected_balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(forecast.projected_balance)}
                      </span>
                    </p>
                    {forecast.pace_pct !== null && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ritmo:{' '}
                        {forecast.pace_pct > 0
                          ? `▲ ${Math.abs(forecast.pace_pct)}% más rápido que el mes pasado`
                          : `▼ ${Math.abs(forecast.pace_pct)}% más lento que el mes pasado`}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )
          })()}

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Top Categorías - {formatMonthYear(year, month)}
            </h2>
            {summary.top_categories.length > 0 ? (
              <div className="space-y-3">
                {summary.top_categories.map((cat) => {
                  const pct = summary.total_expenses > 0 ? (cat.total_amount / summary.total_expenses) * 100 : 0
                  return (
                    <div key={cat.category_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{cat.category_name}</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{formatCurrency(cat.total_amount)}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay gastos registrados este mes</p>
            )}
          </Card>

          {recurring && recurring.items.length > 0 && (() => {
            const total = recurring.items.reduce((sum, i) => sum + i.avg_amount, 0)
            return (
              <Card className="mt-6">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Compromisos detectados</h2>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                    {recurring.items.length} detectados
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Gastos que se repiten mes a mes</p>
                <div className="space-y-3">
                  {recurring.items.map((item) => (
                    <div key={`${item.category_id}-${item.description}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span>🔁</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.description}</span>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mx-3 shrink-0">{item.category_name}</span>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">~{formatCurrency(item.avg_amount)}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">({item.occurrence_months}/{recurring.checked_months} meses)</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total comprometido:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">~{formatCurrency(total)}</span>
                </div>
              </Card>
            )
          })()}
        </>
      ) : (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay datos disponibles para este período</p>
        </Card>
      )}
    </div>
  )
}
