import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { Loading } from '../../../components/ui/Loading'
import { useDebts } from '../../debts/hooks'
import { formatCurrency, formatDate, classNames } from '../../../utils/format'
import { GOAL_KINDS, ROUTES } from '../../../utils/constants'
import type { Debt, GoalKind } from '../../../types/models'
import { useCreateGoal, useGoals } from '../hooks'
import { GoalKindIcon } from './GoalKindIcon'
import { GoalFormFields, type GoalFormValues } from './GoalFormFields'
import { goalSchema } from './goalSchema'

interface NewGoalModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewGoalModal({ isOpen, onClose }: NewGoalModalProps) {
  if (!isOpen) return null
  return <NewGoalFlow onClose={onClose} />
}

function NewGoalFlow({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<GoalKind | null>(null)
  const [debt, setDebt] = useState<Debt | null>(null)
  const createGoal = useCreateGoal()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
  })

  const pickDebt = (selected: Debt) => {
    setDebt(selected)
    setValue('name', `Cuota: ${selected.description}`, { shouldValidate: true })
    setValue('target_amount', Number(selected.remaining_amount ?? selected.original_amount), { shouldValidate: true })
    setValue('target_date', selected.due_date ?? '')
  }

  const onSubmit = (data: GoalFormValues) => {
    if (!kind) return
    createGoal.mutate(
      {
        kind,
        name: data.name,
        target_amount: data.target_amount,
        target_date: data.target_date || null,
        notes: data.notes || null,
        debt_id: kind === 'debt' ? debt?.id : null,
      },
      { onSuccess: onClose },
    )
  }

  const showForm = kind === 'personal' || (kind === 'debt' && debt !== null)

  return (
    <Modal isOpen onClose={onClose} title="Nueva meta" size="lg">
      {kind === null ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">¿Para qué quieres apartar dinero?</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GOAL_KINDS.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={!option.available}
                onClick={() => setKind(option.value)}
                className={classNames(
                  'flex min-h-24 flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  option.available
                    ? 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-indigo-900/20'
                    : 'cursor-not-allowed border-dashed border-gray-300 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-800/50',
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <GoalKindIcon kind={option.value} />
                  {!option.available && <Badge color="gray">Próximamente</Badge>}
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{option.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => { setKind(null); setDebt(null) }}
            className="inline-flex min-h-11 items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiArrowLeft size={16} /> Cambiar tipo de meta
          </button>

          {kind === 'debt' && <DebtPicker selectedId={debt?.id} onPick={pickDebt} />}

          {showForm && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <GoalFormFields
                register={register}
                errors={errors}
                amountHint={kind === 'debt' ? 'Empieza con el saldo de la deuda; cámbialo si solo quieres apartar la cuota.' : undefined}
              />
              <Button type="submit" loading={createGoal.isPending} className="w-full min-h-11">
                Crear meta
              </Button>
            </form>
          )}
        </div>
      )}
    </Modal>
  )
}

function DebtPicker({ selectedId, onPick }: { selectedId?: string; onPick: (debt: Debt) => void }) {
  const { data: debts, isLoading } = useDebts('payable')
  // A debt that already has an active goal can't get a second one.
  const { data: activeGoals } = useGoals('active')
  const taken = new Set((activeGoals ?? []).map((g) => g.debt_id).filter(Boolean))
  const pending = (debts ?? []).filter(
    (d) => (d.status === 'pending' || d.status === 'partially_paid') && !taken.has(d.id),
  )

  if (isLoading) return <Loading />

  if (pending.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-600 dark:border-gray-600 dark:text-gray-400">
        <p>No tienes deudas pendientes sin una meta.</p>
        <Link to={ROUTES.DEBTS} className="mt-1 inline-block font-medium text-indigo-600 dark:text-indigo-400">
          Ir a Deudas
        </Link>
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-label="Deuda" className="space-y-2">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">¿Para cuál deuda?</p>
      {pending.map((d) => {
        const selected = d.id === selectedId
        return (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onPick(d)}
            className={classNames(
              'flex min-h-14 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
              selected
                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400'
                : 'border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700',
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{d.description}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {d.counterparty_name}
                {d.due_date ? ` · vence ${formatDate(d.due_date)}` : ''}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(Number(d.remaining_amount ?? d.original_amount))}
            </p>
            {selected && <FiCheck size={18} className="shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}
