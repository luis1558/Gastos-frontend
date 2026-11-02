import { useForm } from 'react-hook-form'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { formatMonthYear } from '../../../utils/format'
import type { Card } from '../../../types/models'
import { useSetStatement } from '../hooks'

interface StatementModalProps {
  card: Card | null
  year: number
  month: number
  onClose: () => void
}

interface StatementForm {
  amount: number
}

export function StatementModal({ card, year, month, onClose }: StatementModalProps) {
  if (!card) return null
  return <StatementFormBody key={card.id} card={card} year={year} month={month} onClose={onClose} />
}

function StatementFormBody({ card, year, month, onClose }: Required<StatementModalProps> & { card: Card }) {
  const setStatement = useSetStatement(year, month)
  const { register, handleSubmit, setError, formState: { errors } } = useForm<StatementForm>({
    defaultValues: { amount: card.statement_amount ? Number(card.statement_amount) : undefined },
  })

  const onSubmit = (data: StatementForm) => {
    const amount = Number(data.amount)
    if (!(amount > 0)) return setError('amount', { message: 'Ingresa un monto mayor a 0' })
    setStatement.mutate({ id: card.id, amount }, { onSuccess: onClose })
  }

  return (
    <Modal isOpen onClose={onClose} title={`Extracto de ${card.name}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Escribe el valor a pagar de {formatMonthYear(year, month)} tal como aparece en el extracto de tu banco.
        </p>
        <Input
          id="statement_amount"
          label="Valor a pagar"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Button type="submit" loading={setStatement.isPending} className="w-full min-h-11">
          Guardar monto
        </Button>
      </form>
    </Modal>
  )
}
