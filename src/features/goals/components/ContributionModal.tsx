import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { ChoiceCards } from '../../../components/ui/ChoiceCards'
import { formatCurrency, todayLocalDate } from '../../../utils/format'
import type { Goal } from '../../../types/models'
import { useContribute } from '../hooks'

interface ContributionModalProps {
  goal: Goal | null
  available: number
  initialMode?: 'deposit' | 'withdraw'
  onClose: () => void
}

interface ContributionForm {
  amount: number
  contribution_date: string
  notes?: string
}

const MODES = [
  { value: 'deposit', label: 'Apartar', description: 'Sale de tu disponible' },
  { value: 'withdraw', label: 'Devolver', description: 'Vuelve a tu disponible' },
] as const

export function ContributionModal({ goal, available, initialMode = 'deposit', onClose }: ContributionModalProps) {
  if (!goal) return null
  // Remount per goal/mode so the form always starts clean.
  return <ContributionFormBody key={`${goal.id}-${initialMode}`} goal={goal} available={available} initialMode={initialMode} onClose={onClose} />
}

function ContributionFormBody({ goal, available, initialMode, onClose }: Required<Omit<ContributionModalProps, 'goal'>> & { goal: Goal }) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>(initialMode)
  const contribute = useContribute(goal.id)
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<ContributionForm>({
    defaultValues: { contribution_date: todayLocalDate() },
  })

  const saved = Number(goal.saved_amount)
  const remaining = Number(goal.remaining_amount)
  const max = mode === 'deposit' ? Math.min(remaining, Math.max(0, available)) : saved
  // The quick amount is capped by what the user can spare, so say which limit applies.
  const quickLabel =
    mode === 'withdraw' ? 'Devolver todo' : available < remaining ? 'Apartar todo mi disponible' : 'Apartar lo que falta'

  const onSubmit = (data: ContributionForm) => {
    const amount = Number(data.amount)
    if (!(amount > 0)) return setError('amount', { message: 'Ingresa un monto mayor a 0' })
    if (amount > max) {
      const reason = mode === 'withdraw'
        ? 'Solo hay ' + formatCurrency(saved) + ' apartados en esta meta'
        : amount > available
          ? 'Tu disponible es ' + formatCurrency(Math.max(0, available))
          : 'A la meta solo le faltan ' + formatCurrency(remaining)
      return setError('amount', { message: reason })
    }
    contribute.mutate(
      { direction: mode, amount, contribution_date: data.contribution_date, notes: data.notes || undefined },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal isOpen onClose={onClose} title={goal.name} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ChoiceCards inline value={mode} options={MODES} onChange={setMode} />

        <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Disponible</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(available)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Apartado en la meta</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(saved)}</p>
          </div>
        </div>

        <Input
          id="contribution_amount"
          label="Monto"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        {max > 0 && (
          <button
            type="button"
            onClick={() => setValue('amount', Math.round(max * 100) / 100, { shouldValidate: true })}
            className="-mt-2 min-h-11 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            {quickLabel} ({formatCurrency(max)})
          </button>
        )}
        <Input id="contribution_date" label="Fecha" type="date" {...register('contribution_date')} />
        <Input id="contribution_notes" label="Nota (opcional)" placeholder="Ej: parte del bono" {...register('notes')} />

        <Button type="submit" loading={contribute.isPending} className="w-full min-h-11">
          {mode === 'deposit' ? 'Apartar dinero' : 'Devolver al disponible'}
        </Button>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          El dinero no sale de tu cuenta: solo deja de contar como disponible.
        </p>
      </form>
    </Modal>
  )
}
