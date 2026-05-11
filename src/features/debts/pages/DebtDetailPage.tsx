import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDebt, usePayments, useCreatePayment } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { Loading } from '../../../components/ui/Loading'
import { formatCurrency, formatDate } from '../../../utils/format'
import { DEBT_STATUSES, ROUTES } from '../../../utils/constants'
import { FiArrowLeft, FiPlus } from 'react-icons/fi'

const paymentSchema = z.object({
  amount: z.number().positive('Monto debe ser mayor a 0'),
  payment_date: z.string().min(1, 'Fecha requerida'),
  description: z.string().optional(),
})

type PaymentForm = z.infer<typeof paymentSchema>

export function DebtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: debt, isLoading } = useDebt(id!)
  const { data: payments } = usePayments(id!)
  const createPayment = useCreatePayment(id!)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
  })

  const onSubmit = (data: PaymentForm) => {
    createPayment.mutate(data, {
      onSuccess: () => { setModalOpen(false); reset() },
    })
  }

  if (isLoading) return <Loading />

  if (!debt) {
    return (
      <Card>
        <p className="text-center py-8 text-gray-500">Deuda no encontrada</p>
      </Card>
    )
  }

  const statusColor = DEBT_STATUSES.find((s) => s.value === debt.status)?.color as any || 'gray'
  const paidAmount = (payments || []).reduce((sum, p) => sum + p.amount, 0)
  const remaining = debt.original_amount - paidAmount

  return (
    <div>
      <Link to={ROUTES.DEBTS} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <FiArrowLeft size={16} /> Volver a deudas
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{debt.description}</h1>
          <p className="text-gray-500 mt-1">{debt.counterparty_name}</p>
        </div>
        <Badge color={statusColor}>{DEBT_STATUSES.find((s) => s.value === debt.status)?.label || debt.status}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500">Monto Original</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(debt.original_amount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pagado</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Saldo Pendiente</p>
          <p className={`text-xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.max(0, remaining))}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tipo</p>
            <p className="font-medium">{debt.type === 'receivable' ? 'Por cobrar' : 'Por pagar'}</p>
          </div>
          <div>
            <p className="text-gray-500">Fecha de origen</p>
            <p className="font-medium">{formatDate(debt.origin_date)}</p>
          </div>
          {debt.due_date && (
            <div>
              <p className="text-gray-500">Vencimiento</p>
              <p className="font-medium">{formatDate(debt.due_date)}</p>
            </div>
          )}
          {debt.notes && (
            <div className="col-span-2">
              <p className="text-gray-500">Notas</p>
              <p className="font-medium">{debt.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pagos</h2>
          {debt.status !== 'paid' && debt.status !== 'cancelled' && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <FiPlus size={16} className="mr-1" /> Registrar Pago
            </Button>
          )}
        </div>

        {payments && payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{payment.description || 'Pago'}</p>
                  <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
                </div>
                <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">Sin pagos registrados</p>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Pago">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="amount"
            label="Monto"
            type="number"
            step="0.01"
            placeholder="0"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />
          <Input
            id="payment_date"
            label="Fecha de pago"
            type="date"
            error={errors.payment_date?.message}
            {...register('payment_date')}
          />
          <Input
            id="description"
            label="Descripción (opcional)"
            placeholder="Nota del pago"
            {...register('description')}
          />
          <Button type="submit" loading={createPayment.isPending} className="w-full">
            Registrar Pago
          </Button>
        </form>
      </Modal>
    </div>
  )
}
