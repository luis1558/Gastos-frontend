import { Link } from 'react-router-dom'
import { FiArrowDownLeft, FiArrowUpRight, FiAlertCircle } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { formatCurrency } from '../../../utils/format'
import { ROUTES } from '../../../utils/constants'
import { useDebtSummary } from '../../debts/hooks'
import { BlockError } from './BlockError'

const TITLE = 'Deudas'

export function DebtsCard() {
  const { data, isError, refetch } = useDebtSummary()

  if (isError) return <BlockError title={TITLE} onRetry={() => refetch()} />
  if (!data) return null

  const receivable = Number(data.total_receivable_pending)
  const payable = Number(data.total_payable_pending)
  const overdue = Number(data.overdue_receivable_count) + Number(data.overdue_payable_count)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{TITLE}</h2>
        <Link to={ROUTES.DEBTS} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          Ver deudas
        </Link>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FiArrowDownLeft className="text-green-600 dark:text-green-400" /> Por cobrar
          </span>
          <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(receivable)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FiArrowUpRight className="text-red-600 dark:text-red-400" /> Por pagar
          </span>
          <span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(payable)}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FiAlertCircle className={overdue > 0 ? 'text-yellow-500' : 'text-gray-400'} /> Vencidas
          </span>
          <span className={`font-semibold ${overdue > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {overdue}
          </span>
        </div>
      </div>
    </Card>
  )
}
