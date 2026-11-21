import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { CategorySummary } from '../../../types/models'
import { formatCurrency } from '../../../utils/format'
import { CHART_COLORS, TOOLTIP_STYLE } from '../chartUtils'
import { BlockEmpty } from './BlockStates'

/** S11: donut of the selected month's expenses by category. */
export function CategoryDonut({ categories, emptyMessage }: { categories: CategorySummary[]; emptyMessage: string }) {
  const data = categories
    .map((c) => ({ name: c.category_name, value: Number(c.total_amount) }))
    .filter((d) => d.value > 0)

  if (!data.length) return <BlockEmpty message={emptyMessage} />

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
            {data.map((d, idx) => (
              <Cell key={d.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={TOOLTIP_STYLE} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
