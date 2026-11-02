import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../utils/format'
import { ROUTES } from '../../../utils/constants'
import { useGoalOverview } from '../hooks'

/** Non-blocking notice shown while typing an expense that would dip into money set aside in goals. */
export function AvailableWarning({ amount }: { amount?: number }) {
  const { data: overview } = useGoalOverview()
  const value = Number(amount)
  if (!overview || !(value > 0)) return null

  const available = Number(overview.available)
  if (Number(overview.reserved) <= 0 || value <= available) return null

  return (
    <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
      Este gasto supera tu disponible ({formatCurrency(Math.max(0, available))}): una parte saldría de dinero que
      apartaste en tus metas.{' '}
      <Link to={ROUTES.GOALS} className="font-medium underline">Ver metas</Link>
    </p>
  )
}
