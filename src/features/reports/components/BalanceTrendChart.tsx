import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'
import type { YearMonthItem } from '../../../types/models'
import { formatCurrency } from '../../../utils/format'
import { MONTH_NAMES } from '../../../utils/constants'
import { TOOLTIP_STYLE, formatAxisCurrency } from '../chartUtils'
import { BlockEmpty } from './BlockStates'

/** S12: monthly balance and accumulated savings across the year. */
export function BalanceTrendChart({ months, year }: { months: YearMonthItem[]; year: number }) {
  const hasData = months.some((m) => Number(m.total_income) !== 0 || Number(m.total_expenses) !== 0)
  if (!hasData) return <BlockEmpty message={`No hay datos para ${year}`} />

  const balances = months.map((m) => Number(m.balance))
  const data = months.map((m, i) => ({
    name: MONTH_NAMES[m.month].slice(0, 3),
    Balance: balances[i],
    'Ahorro acumulado': balances.slice(0, i + 1).reduce((sum, b) => sum + b, 0),
  }))

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAxisCurrency} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} />
          <Legend />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Line type="monotone" dataKey="Balance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Ahorro acumulado" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
