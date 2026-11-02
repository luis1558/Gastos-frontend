import { useForm } from 'react-hook-form'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { formatCurrency, todayLocalDate } from '../../../utils/format'
import type { FixedPayment } from '../../../types/models'
import { usePayFixedPayment } from '../hooks'

interface PayFixedPaymentModalProps {
  fixedPayment: FixedPayment | null
  year: number
  month: number
  onClose: () => void
}

interface PayForm {
  amount: number
  paid_on: string
}

export function PayFixedPaymentModal({ fixedPayment, year, month, onClose }: PayFixedPaymentModalProps) {
  if (!fixedPayment) return null
  return <PayForm key={fixedPayment.id} fixedPayment={fixedPayment} year={year} month={month} onClose={onClose} />
}

function PayForm({ fixedPayment, year, month, onClose }: Required<PayFixedPaymentModalProps> & { fixedPayment: FixedPayment }) {
  const pay = usePayFixedPayment()
  const { register, handleSubmit, setError, formState: { errors } } = useForm<PayForm>({
    defaultValues: { amount: Number(fixedPayment.amount), paid_on: todayLocalDate() },
  })

  const onSubmit = (data: PayForm) => {
    const amount = Number(data.amount)
    if (!(amount > 0)) return setError('amount', { message: 'Ingresa un monto mayor a 0' })
    pay.mutate({ id: fixedPayment.id, year, month, amount, paid_on: data.paid_on }, { onSuccess: onClose })
  }

  return (
    <Modal isOpen onClose={onClose} title={`Pagar ${fixedPayment.name}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Se registrará un gasto de la categoría <strong>{fixedPayment.category_name}</strong>. Si este mes pagaste un valor
          distinto a {formatCurrency(Number(fixedPayment.amount))}, cámbialo aquí.
        </p>
        <Input
          id="pay_amount"
          label="Monto pagado"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Input id="pay_date" label="Fecha de pago" type="date" {...register('paid_on')} />
        <Button type="submit" loading={pay.isPending} className="w-full min-h-11">
          Marcar como pagado
        </Button>
      </form>
    </Modal>
  )
}
