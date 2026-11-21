import { Link } from 'react-router-dom'
import { FiCheckCircle, FiClock } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/format'
import { ROUTES } from '../../../utils/constants'
import { useFixedPayments } from '../../fixed-payments/hooks'
import { BlockError } from './BlockError'

const TITLE = 'Pagos fijos del mes'

export function FixedPaymentsCard({ year, month }: { year: number; month: number }) {
  const { data, isError, refetch } = useFixedPayments(year, month)

  if (isError) return <BlockError title={TITLE} onRetry={() => refetch()} />
  if (!data) return null

  const active = data.filter((p) => p.is_active || p.status === 'paid')
  const paid = active.filter((p) => p.status === 'paid')
  const pending = active.filter((p) => p.status !== 'paid')
  const paidAmount = paid.reduce((sum, p) => sum + Number(p.paid_amount ?? p.amount), 0)
  const pendingAmount = pending.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{TITLE}</h2>
        <Link to={ROUTES.FIXED_PAYMENTS} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          Ver pagos
        </Link>
      </div>
      {active.length > 0 ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FiCheckCircle className="text-green-600 dark:text-green-400" /> Pagados ({paid.length})
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(paidAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FiClock className="text-yellow-500" /> Pendientes ({pending.length})
            </span>
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">{formatCurrency(pendingAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400">Total del mes</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(paidAmount + pendingAmount)}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6">No hay pagos fijos este mes</p>
      )}
    </Card>
  )
}
