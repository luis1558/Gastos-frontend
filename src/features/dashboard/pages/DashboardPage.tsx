import { useMonthlySummary } from '../hooks'
import { useRecurringExpenses } from '../../reports/hooks'
import { Card } from '../../../components/ui/Card'
import { Loading } from '../../../components/ui/Loading'
import { formatCurrency, formatMonthYear, getCurrentYear, getCurrentMonth } from '../../../utils/format'
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi'
import { useState } from 'react'
import { MONTH_NAMES } from '../../../utils/constants'
import { AvailableCard } from '../../goals/components/AvailableCard'
import { UpcomingAlerts } from '../../alerts/components/UpcomingAlerts'
import { BlockError } from '../components/BlockError'
import { ForecastCard } from '../components/ForecastCard'
import { DebtsCard } from '../components/DebtsCard'
import { GoalsCard } from '../components/GoalsCard'
import { FixedPaymentsCard } from '../components/FixedPaymentsCard'

const TOP_CATEGORIES_LIMIT = 5

export function DashboardPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [month, setMonth] = useState(getCurrentMonth())
  const { data, isLoading, isError, refetch } = useMonthlySummary(year, month)
  const recurringQuery = useRecurringExpenses()
  const recurring = recurringQuery.data

  if (isLoading) return <Loading />

  const summary = data
  const totalIncome = Number(summary?.total_income ?? 0)
  const totalExpenses = Number(summary?.total_expenses ?? 0)
  const balance = Number(summary?.balance ?? 0)
  const topCategories = (summary?.top_categories ?? []).slice(0, TOP_CATEGORIES_LIMIT)

  // These blocks have their own requests, so they stay visible even if the monthly summary fails.
  const independentBlocks = (
    <>
      <ForecastCard year={year} month={month} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DebtsCard />
        <FixedPaymentsCard year={year} month={month} />
        <GoalsCard />
      </div>
    </>
  )

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

      <AvailableCard />

      <UpcomingAlerts />

      {isError ? (
        <>
          <BlockError title="Resumen del mes" onRetry={() => refetch()} className="mb-6" />
          {independentBlocks}
        </>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl dark:bg-green-900/30">
                  <FiTrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalIncome)}</p>
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
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalExpenses)}</p>
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
                  <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {independentBlocks}

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Top {TOP_CATEGORIES_LIMIT} Categorías - {formatMonthYear(year, month)}
            </h2>
            {topCategories.length > 0 ? (
              <div className="space-y-3">
                {topCategories.map((cat) => {
                  const amount = Number(cat.total_amount)
                  const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                  return (
                    <div key={cat.category_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{cat.category_name}</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{formatCurrency(amount)}</span>
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

          {recurringQuery.isError && (
            <BlockError title="Compromisos detectados" onRetry={() => recurringQuery.refetch()} className="mt-6" />
          )}

          {recurring && recurring.items.length > 0 && (() => {
            const total = recurring.items.reduce((sum, i) => sum + Number(i.avg_amount), 0)
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
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">~{formatCurrency(Number(item.avg_amount))}</p>
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
        <>
          {independentBlocks}
          <Card>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay datos disponibles para este período</p>
          </Card>
        </>
      )}
    </div>
  )
}
