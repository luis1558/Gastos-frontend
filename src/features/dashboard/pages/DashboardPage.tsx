import { useMonthlySummary } from '../hooks'
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

  if (isLoading) return <Loading />

  const summary = data

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            {MONTH_NAMES.slice(1).map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
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
                <div className="p-3 bg-green-100 rounded-xl">
                  <FiTrendingUp size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ingresos</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.total_income)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <FiTrendingDown size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gastos</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.total_expenses)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <FiDollarSign size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Top Categorías - {formatMonthYear(year, month)}
            </h2>
            {summary.top_categories.length > 0 ? (
              <div className="space-y-3">
                {summary.top_categories.map((cat) => {
                  const pct = summary.total_expenses > 0 ? (cat.total_amount / summary.total_expenses) * 100 : 0
                  return (
                    <div key={cat.category_id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{cat.category_name}</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(cat.total_amount)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
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
              <p className="text-gray-500 text-center py-8">No hay gastos registrados este mes</p>
            )}
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-8">No hay datos disponibles para este período</p>
        </Card>
      )}
    </div>
  )
}
