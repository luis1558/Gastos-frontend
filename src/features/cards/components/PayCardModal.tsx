import { useForm } from 'react-hook-form'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { todayLocalDate } from '../../../utils/format'
import type { Card } from '../../../types/models'
import { usePayCard } from '../hooks'

interface PayCardModalProps {
  card: Card | null
  year: number
  month: number
  onClose: () => void
}

interface PayForm {
  amount: number
  paid_on: string
}

export function PayCardModal({ card, year, month, onClose }: PayCardModalProps) {
  if (!card) return null
  return <PayFormBody key={card.id} card={card} year={year} month={month} onClose={onClose} />
}

function PayFormBody({ card, year, month, onClose }: Required<PayCardModalProps> & { card: Card }) {
  const pay = usePayCard()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<PayForm>({
    defaultValues: { amount: Number(card.statement_amount), paid_on: todayLocalDate() },
  })

  const onSubmit = (data: PayForm) => {
    const amount = Number(data.amount)
    if (!(amount > 0)) return setError('amount', { message: 'Ingresa un monto mayor a 0' })
    pay.mutate({ id: card.id, year, month, amount, paid_on: data.paid_on }, { onSuccess: onClose })
  }

  return (
    <Modal isOpen onClose={onClose} title={`Pagar ${card.name}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {card.tracks_purchases ? (
            <>
              No se creará un gasto: ya registras cada compra de esta tarjeta y contarlo otra vez duplicaría el dinero.
            </>
          ) : (
            <>
              Se registrará un gasto de la categoría <strong>{card.category_name}</strong>.
            </>
          )}
        </p>
        <Input
          id="pay_card_amount"
          label="Monto pagado"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Input id="pay_card_date" label="Fecha de pago" type="date" {...register('paid_on')} />
        <Button type="submit" loading={pay.isPending} className="w-full min-h-11">
          Marcar como pagada
        </Button>
      </form>
    </Modal>
  )
}
