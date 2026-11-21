import { useSpendingBreakdown } from '../hooks'
import { formatCurrency } from '../../../utils/format'
import { MONTH_NAMES } from '../../../utils/constants'
import { paymentMethodLabel } from '../chartUtils'
import { BlockEmpty, BlockError, BlockLoading } from './BlockStates'

interface Row {
  key: string
  label: string
  amount: number
  count: number
}

function BreakdownList({ title, rows, emptyMessage, barClass }: {
  title: string
  rows: Row[]
  emptyMessage: string
  barClass: string
}) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0)
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{title}</p>
      {rows.length === 0 ? (
        <BlockEmpty message={emptyMessage} />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.amount / total) * 100) : 0
            return (
              <div key={r.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {r.label}{' '}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      · {r.count} {r.count === 1 ? 'gasto' : 'gastos'}
                    </span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatCurrency(r.amount)} <span className="text-xs">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${barClass} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** S14: selected month's spending by payment method and by card. */
export function SpendingBreakdown({ year, month }: { year: number; month: number }) {
  const { data, isLoading, isError, refetch } = useSpendingBreakdown(year, month)

  if (isLoading) return <BlockLoading />
  if (isError || !data) {
    return <BlockError message="No se pudo cargar el gasto por medio de pago." onRetry={() => refetch()} />
  }

  const byMethod: Row[] = data.by_payment_method.map((m, idx) => ({
    key: m.payment_method ?? `none-${idx}`,
    label: paymentMethodLabel(m.payment_method),
    amount: Number(m.amount),
    count: m.count,
  }))
  const byCard: Row[] = data.by_card.map((c) => ({
    key: c.card_id,
    label: c.card_name,
    amount: Number(c.amount),
    count: c.count,
  }))
  const period = `${MONTH_NAMES[month]} ${year}`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BreakdownList
        title="Por medio de pago"
        rows={byMethod}
        emptyMessage={`Sin gastos en ${period}`}
        barClass="bg-indigo-500"
      />
      <BreakdownList
        title="Por tarjeta"
        rows={byCard}
        emptyMessage={`Sin gastos con tarjeta en ${period}`}
        barClass="bg-amber-500"
      />
    </div>
  )
}
