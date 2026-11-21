import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCategoryTrend } from '../hooks'
import { formatCurrency } from '../../../utils/format'
import { MONTH_NAMES } from '../../../utils/constants'
import { CHART_COLORS, TOOLTIP_STYLE, formatAxisCurrency } from '../chartUtils'
import { BlockEmpty, BlockError, BlockLoading } from './BlockStates'

/** S13: monthly spending of the top 5 categories across the year. */
export function CategoryTrendChart({ year }: { year: number }) {
  const { data, isLoading, isError, refetch } = useCategoryTrend(year)

  if (isLoading) return <BlockLoading />
  if (isError || !data) {
    return <BlockError message="No se pudo cargar la evolución por categoría." onRetry={() => refetch()} />
  }

  const categories = data.categories.slice(0, 5)
  const hasData = categories.some((c) => c.monthly.some((v) => Number(v) !== 0))
  if (!hasData) return <BlockEmpty message={`Sin gastos por categoría en ${year}`} />

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const row: Record<string, string | number> = { name: MONTH_NAMES[i + 1].slice(0, 3) }
    categories.forEach((c, idx) => {
      row[`c${idx}`] = Number(c.monthly[i] ?? 0)
    })
    return row
  })

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={formatAxisCurrency} />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} />
          <Legend />
          {categories.map((c, idx) => (
            <Line
              key={c.category_id ?? `none-${idx}`}
              type="monotone"
              dataKey={`c${idx}`}
              name={c.category_name}
              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
