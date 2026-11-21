import { useState, type ReactNode } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useYearlySummary, useMonthlySummary } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency, getCurrentYear, getCurrentMonth } from '../../../utils/format'
import { MONTH_NAMES } from '../../../utils/constants'
import { TOOLTIP_STYLE, formatAxisCurrency, yearlySavingsRate } from '../chartUtils'
import { BlockEmpty, BlockError } from '../components/BlockStates'
import { BalanceTrendChart } from '../components/BalanceTrendChart'
import { CategoryTrendChart } from '../components/CategoryTrendChart'
import { CategoryDonut } from '../components/CategoryDonut'
import { IncomeBreakdown } from '../components/IncomeBreakdown'
import { SpendingBreakdown } from '../components/SpendingBreakdown'

const SELECT_CLASS =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{children}</h2>
}

export function ReportsPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const yearly = useYearlySummary(year)
  const monthly = useMonthlySummary(year, selectedMonth)
  const data = yearly.data
  const monthlyData = monthly.data

  const chartData = data?.months.map((m) => ({
    name: MONTH_NAMES[m.month].slice(0, 3),
    Ingresos: Number(m.total_income),
    Gastos: Number(m.total_expenses),
  })) || []
  const yearHasData = chartData.some((m) => m.Ingresos !== 0 || m.Gastos !== 0)

  const savingsRate = data ? yearlySavingsRate(data.balance, data.total_income) : null

  const monthlySavingsRate =
    monthlyData && Number(monthlyData.total_income) > 0
      ? Math.round((Number(monthlyData.balance) / Number(monthlyData.total_income)) * 100)
      : null
  const monthLabel = `${MONTH_NAMES[selectedMonth]} ${year}`

  return (
    <div>
      <PageHeader
        title="Reportes"
        description={`Resumen anual ${year}`}
        action={
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={SELECT_CLASS}>
            {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        }
      />

      {yearly.isLoading ? (
        <Loading />
      ) : yearly.isError || !data ? (
        <Card className="mb-6">
          <BlockError message="No se pudo cargar el resumen anual." onRetry={() => yearly.refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos Totales</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(Number(data.total_income))}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gastos Totales</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(Number(data.total_expenses))}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance Anual</p>
              <p className={`text-xl font-bold ${Number(data.balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Number(data.balance))}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tasa de Ahorro</p>
              <p className={`text-xl font-bold ${(savingsRate ?? 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {savingsRate !== null ? `${savingsRate}%` : '—'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">balance ÷ ingresos del año</p>
            </Card>
          </div>

          <Card className="mb-6">
            <SectionTitle>Ingresos vs Gastos — {year}</SectionTitle>
            {yearHasData ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAxisCurrency} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <BlockEmpty message="No hay datos para este año" />
            )}
          </Card>

          <Card className="mb-6">
            <SectionTitle>Balance y ahorro — {year}</SectionTitle>
            <BalanceTrendChart months={data.months} year={year} />
          </Card>
        </>
      )}

      <Card className="mb-6">
        <SectionTitle>Top 5 categorías por mes — {year}</SectionTitle>
        <CategoryTrendChart year={year} />
      </Card>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detalle mensual</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className={SELECT_CLASS}
          >
            {MONTH_NAMES.slice(1).map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>

        {monthly.isLoading ? (
          <Loading />
        ) : monthly.isError || !monthlyData ? (
          <BlockError message="No se pudo cargar el detalle del mes." onRetry={() => monthly.refetch()} />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
                <p className="font-bold text-green-600">{formatCurrency(Number(monthlyData.total_income))}</p>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Gastos</p>
                <p className="font-bold text-red-600">{formatCurrency(Number(monthlyData.total_expenses))}</p>
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
                  {formatCurrency(Number(monthlyData.balance))}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Ingreso base vs extra</p>
              <IncomeBreakdown base={monthlyData.base_income} extra={monthlyData.extra_income} />
            </div>

            {monthlyData.top_categories.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Distribución</p>
                  <CategoryDonut categories={monthlyData.top_categories} emptyMessage={`Sin gastos en ${monthLabel}`} />
                </div>
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
                            {formatCurrency(Number(cat.total_amount))}{' '}
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
              </div>
            ) : (
              <BlockEmpty message={`Sin gastos en ${monthLabel}`} />
            )}
          </>
        )}
      </Card>

      <Card>
        <SectionTitle>Medios de pago y tarjetas — {monthLabel}</SectionTitle>
        <SpendingBreakdown year={year} month={selectedMonth} />
      </Card>
    </div>
  )
}
