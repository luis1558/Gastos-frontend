import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useYearlySummary, useMonthlySummary } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency, getCurrentYear, getCurrentMonth } from '../../../utils/format'
import { MONTH_NAMES } from '../../../utils/constants'

export function ReportsPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const { data, isLoading } = useYearlySummary(year)
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlySummary(year, selectedMonth)

  if (isLoading) return <Loading />

  const chartData = data?.months.map((m) => ({
    name: MONTH_NAMES[m.month].slice(0, 3),
    Ingresos: Number(m.total_income),
    Gastos: Number(m.total_expenses),
  })) || []

  const avgSavingsRate = (() => {
    if (!data?.months.length) return null
    const withIncome = data.months.filter((m) => Number(m.total_income) > 0)
    if (!withIncome.length) return null
    const avg = withIncome.reduce(
      (sum, m) => sum + (Number(m.balance) / Number(m.total_income)) * 100,
      0,
    ) / withIncome.length
    return Math.round(avg)
  })()

  const monthlySavingsRate =
    monthlyData && Number(monthlyData.total_income) > 0
      ? Math.round((Number(monthlyData.balance) / Number(monthlyData.total_income)) * 100)
      : null

  return (
    <div>
      <PageHeader
        title="Reportes"
        description={`Resumen anual ${year}`}
        action={
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        }
      />

      {data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.total_income)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Totales</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(data.total_expenses)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance Anual</p>
              <p className={`text-xl font-bold ${Number(data.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.balance)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasa de Ahorro</p>
              <p className={`text-xl font-bold ${(avgSavingsRate ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {avgSavingsRate !== null ? `${avgSavingsRate}%` : '—'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">promedio anual</p>
            </Card>
          </div>

          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Ingresos vs Gastos — {year}
            </h2>
            {chartData.length > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay datos para este año</p>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detalle mensual</h2>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>

            {monthlyLoading ? (
              <Loading />
            ) : monthlyData ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
                    <p className="font-bold text-green-600">{formatCurrency(monthlyData.total_income)}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gastos</p>
                    <p className="font-bold text-red-600">{formatCurrency(monthlyData.total_expenses)}</p>
                  </div>
                  <div
                    className={`text-center p-3 rounded-lg ${
                      Number(monthlyData.balance) >= 0
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Balance{monthlySavingsRate !== null ? ` · ${monthlySavingsRate}% ahorro` : ''}
                    </p>
                    <p className={`font-bold ${Number(monthlyData.balance) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(monthlyData.balance)}
                    </p>
                  </div>
                </div>

                {monthlyData.top_categories.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Gastos por categoría</p>
                    {monthlyData.top_categories.map((cat) => {
                      const pct =
                        Number(monthlyData.total_expenses) > 0
                          ? Math.round((Number(cat.total_amount) / Number(monthlyData.total_expenses)) * 100)
                          : 0
                      return (
                        <div key={cat.category_id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 dark:text-gray-300">{cat.category_name}</span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {formatCurrency(cat.total_amount)}{' '}
                              <span className="text-xs">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
                    Sin gastos en {MONTH_NAMES[selectedMonth]} {year}
                  </p>
                )}
              </>
            ) : null}
          </Card>
        </>
      )}
    </div>
  )
}
