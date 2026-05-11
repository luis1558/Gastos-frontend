import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useYearlySummary } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency, getCurrentYear } from '../../../utils/format'
import { MONTH_NAMES } from '../../../utils/constants'

export function ReportsPage() {
  const [year, setYear] = useState(getCurrentYear())
  const { data, isLoading } = useYearlySummary(year)

  if (isLoading) return <Loading />

  const chartData = data?.months.map((m) => ({
    name: MONTH_NAMES[m.month].slice(0, 3),
    Ingresos: m.total_income,
    Gastos: m.total_expenses,
  })) || []

  return (
    <div>
      <PageHeader
        title="Reportes"
        description={`Resumen anual ${year}`}
        action={
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
          >
            {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        }
      />

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <p className="text-sm text-gray-500">Ingresos Totales</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.total_income)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Gastos Totales</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(data.total_expenses)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Balance Anual</p>
              <p className={`text-xl font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.balance)}
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ingresos vs Gastos - {year}
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
              <p className="text-gray-500 text-center py-8">No hay datos para este año</p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
