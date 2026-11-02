import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiArrowDownCircle, FiArrowUpCircle, FiEdit2, FiCheckCircle, FiTrash2, FiCalendar } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Loading } from '../../../components/ui/Loading'
import { formatCurrency, formatDate } from '../../../utils/format'
import { GOAL_KINDS, ROUTES } from '../../../utils/constants'
import { useGoal, useContributions, useGoalOverview, useCompleteGoal, useDeleteGoal } from '../hooks'
import { GoalKindIcon } from '../components/GoalKindIcon'
import { ProgressBar } from '../components/ProgressBar'
import { describeTargetDate, dateToneClass } from '../components/goalDates'
import { ContributionModal } from '../components/ContributionModal'
import { EditGoalModal } from '../components/EditGoalModal'

export function GoalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'deposit' | 'withdraw' | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const { data: goal, isLoading } = useGoal(id!)
  const { data: contributions } = useContributions(id!)
  const { data: overview } = useGoalOverview()
  const completeGoal = useCompleteGoal(id!)
  const deleteGoal = useDeleteGoal(id!)

  if (isLoading) return <Loading />

  if (!goal) {
    return (
      <Card>
        <p className="py-8 text-center text-gray-500 dark:text-gray-400">Meta no encontrada</p>
      </Card>
    )
  }

  const kindLabel = GOAL_KINDS.find((k) => k.value === goal.kind)?.label ?? ''
  const hint = describeTargetDate(goal.target_date)
  const percent = Number(goal.progress_percent)
  const saved = Number(goal.saved_amount)
  const active = goal.status === 'active'

  const onComplete = () => {
    if (window.confirm('¿Marcar esta meta como cumplida? El dinero apartado volverá a estar disponible.')) {
      completeGoal.mutate()
    }
  }

  const onDelete = () => {
    if (window.confirm('¿Eliminar esta meta? El dinero apartado volverá a estar disponible.')) {
      deleteGoal.mutate(undefined, { onSuccess: () => navigate(ROUTES.GOALS) })
    }
  }

  return (
    <div>
      <Link
        to={ROUTES.GOALS}
        className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <FiArrowLeft size={16} /> Volver a metas
      </Link>

      <div className="mb-6 flex items-start gap-3">
        <GoalKindIcon kind={goal.kind} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-2xl font-bold text-gray-900 dark:text-gray-100">{goal.name}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{goal.debt_label || kindLabel}</p>
        </div>
        {!active && <Badge color="green">Cumplida</Badge>}
      </div>

      <Card className="mb-6">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(saved)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">de {formatCurrency(Number(goal.target_amount))}</p>
        </div>
        <ProgressBar percent={percent} label="Progreso de la meta" className="h-3" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            {percent >= 100 ? '¡Meta completa!' : `Faltan ${formatCurrency(Number(goal.remaining_amount))}`}
          </p>
          <p className={`flex items-center gap-1.5 ${dateToneClass[hint.tone]}`}>
            <FiCalendar size={14} aria-hidden="true" /> {hint.text}
          </p>
        </div>
        {goal.notes && <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{goal.notes}</p>}
      </Card>

      {active && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          <Button className="min-h-11" onClick={() => setMode('deposit')} disabled={Number(goal.remaining_amount) <= 0}>
            <FiArrowDownCircle size={16} className="mr-1.5" /> Apartar
          </Button>
          <Button variant="secondary" className="min-h-11" onClick={() => setMode('withdraw')} disabled={saved <= 0}>
            <FiArrowUpCircle size={16} className="mr-1.5" /> Devolver
          </Button>
          <Button variant="secondary" className="min-h-11" onClick={() => setEditOpen(true)}>
            <FiEdit2 size={16} className="mr-1.5" /> Editar
          </Button>
          <Button variant="secondary" className="min-h-11" onClick={onComplete} loading={completeGoal.isPending}>
            <FiCheckCircle size={16} className="mr-1.5" /> Cumplida
          </Button>
        </div>
      )}

      <Card className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Movimientos</h2>
        {contributions && contributions.length > 0 ? (
          <div className="space-y-1">
            {contributions.map((item) => {
              const amount = Number(item.amount)
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {amount > 0 ? 'Apartaste' : 'Devolviste'}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(item.contribution_date)}
                      {item.notes ? ` · ${item.notes}` : ''}
                    </p>
                  </div>
                  <p className={`shrink-0 font-semibold ${amount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {amount > 0 ? '+' : '−'}{formatCurrency(Math.abs(amount))}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-gray-500 dark:text-gray-400">Aún no has apartado dinero para esta meta</p>
        )}
      </Card>

      <button
        type="button"
        onClick={onDelete}
        disabled={deleteGoal.isPending}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
      >
        <FiTrash2 size={16} aria-hidden="true" /> Eliminar meta
      </button>

      <ContributionModal
        goal={mode ? goal : null}
        available={Number(overview?.available ?? 0)}
        initialMode={mode ?? 'deposit'}
        onClose={() => setMode(null)}
      />
      <EditGoalModal goal={goal} isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
