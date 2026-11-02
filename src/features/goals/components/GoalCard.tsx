import { Link } from 'react-router-dom'
import { FiCalendar } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { formatCurrency } from '../../../utils/format'
import { GOAL_KINDS, ROUTES } from '../../../utils/constants'
import type { Goal } from '../../../types/models'
import { GoalKindIcon } from './GoalKindIcon'
import { ProgressBar } from './ProgressBar'
import { describeTargetDate, dateToneClass } from './goalDates'

interface GoalCardProps {
  goal: Goal
  onContribute: (goal: Goal) => void
}

export function GoalCard({ goal, onContribute }: GoalCardProps) {
  const kindLabel = GOAL_KINDS.find((k) => k.value === goal.kind)?.label ?? ''
  const hint = describeTargetDate(goal.target_date)
  const percent = Number(goal.progress_percent)
  const completed = goal.status === 'completed'

  return (
    <Card className="flex h-full flex-col gap-4 transition-shadow hover:shadow-md">
      <Link to={ROUTES.GOAL_DETAIL(goal.id)} className="flex flex-1 flex-col gap-4 focus:outline-none">
        <div className="flex items-start gap-3">
          <GoalKindIcon kind={goal.kind} />
          <div className="min-w-0 flex-1">
            <p className="break-words font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{goal.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{goal.debt_label || goal.fixed_payment_label || goal.card_label || kindLabel}</p>
          </div>
          {completed && <Badge color="green">Cumplida</Badge>}
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(Number(goal.saved_amount))}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">de {formatCurrency(Number(goal.target_amount))}</p>
          </div>
          <ProgressBar percent={percent} label={`Progreso de ${goal.name}`} />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{Math.round(percent)}% apartado</p>
        </div>

        <p className={`flex items-center gap-1.5 text-sm ${dateToneClass[hint.tone]}`}>
          <FiCalendar size={14} aria-hidden="true" /> {hint.text}
        </p>
      </Link>

      {!completed && (
        <Button
          variant="secondary"
          className="w-full min-h-11"
          onClick={() => onContribute(goal)}
          disabled={Number(goal.remaining_amount) <= 0}
        >
          {Number(goal.remaining_amount) <= 0 ? 'Meta completa' : 'Apartar dinero'}
        </Button>
      )}
    </Card>
  )
}
