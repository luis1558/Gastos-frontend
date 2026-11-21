import type { DecimalValue } from '../types'
import { formatCurrency } from '../../../utils/format'

/** S10: base vs extra income for the selected month. */
export function IncomeBreakdown({ base, extra }: { base: DecimalValue; extra: DecimalValue }) {
  const baseAmount = Number(base) || 0
  const extraAmount = Number(extra) || 0
  const total = baseAmount + extraAmount

  if (total <= 0) {
    return (
      <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">
        Sin ingresos registrados este mes
      </p>
    )
  }

  const basePct = Math.round((baseAmount / total) * 100)
  const extraPct = 100 - basePct

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-700 dark:text-gray-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-1.5" />
          Base: <span className="font-semibold">{formatCurrency(baseAmount)}</span>{' '}
          <span className="text-xs text-gray-400 dark:text-gray-500">({basePct}%)</span>
        </span>
        <span className="text-gray-700 dark:text-gray-300">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-300 mr-1.5" />
          Extra: <span className="font-semibold">{formatCurrency(extraAmount)}</span>{' '}
          <span className="text-xs text-gray-400 dark:text-gray-500">({extraPct}%)</span>
        </span>
      </div>
      <div className="w-full flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        <div className="bg-green-500 h-3" style={{ width: `${basePct}%` }} />
        <div className="bg-emerald-300 h-3" style={{ width: `${extraPct}%` }} />
      </div>
    </div>
  )
}
