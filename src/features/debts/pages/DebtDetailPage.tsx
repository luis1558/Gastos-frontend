import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDebt, usePayments, useCreatePayment, useRateChanges, useCreateRateChange, useDeleteRateChange } from '../hooks'
import { useCategories } from '../../expenses/hooks'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { Loading } from '../../../components/ui/Loading'
import { formatCurrency, formatDate, todayLocalDate } from '../../../utils/format'
import { DEBT_STATUSES, ROUTES } from '../../../utils/constants'
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi'
import { formatRate, interestTypeLabel, rateTypeLabel } from '../interest'

const paymentSchema = z.object({
  amount: z.number().positive('Monto debe ser mayor a 0'),
  payment_date: z.string().min(1, 'Fecha requerida'),
  description: z.string().optional(),
  category_id: z.string().optional(),
})

type PaymentForm = z.infer<typeof paymentSchema>

const rateChangeSchema = z.object({
  effective_date: z.string().min(1, 'Fecha requerida'),
  rate: z.number({ message: 'Ingresa una tasa' }).positive('La tasa debe ser mayor a 0'),
})

type RateChangeForm = z.infer<typeof rateChangeSchema>

export function DebtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [modalOpen, setModalOpen] = useState(false)
  const [rateModalOpen, setRateModalOpen] = useState(false)

  const { data: debt, isLoading } = useDebt(id!)
  const { data: payments } = usePayments(id!)
  const createPayment = useCreatePayment(id!)
  const { data: categories } = useCategories(true)
  const isVariable = debt?.interest_type !== 'none' && debt?.rate_type === 'variable'
  const { data: rateChanges } = useRateChanges(id!, !!isVariable)
  const createRateChange = useCreateRateChange(id!)
  const deleteRateChange = useDeleteRateChange(id!)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment_date: todayLocalDate() },
  })
  const rateForm = useForm<RateChangeForm>({
    resolver: zodResolver(rateChangeSchema),
    defaultValues: { effective_date: todayLocalDate() },
  })

  const onSubmit = (data: PaymentForm) => {
    createPayment.mutate(data, {
      onSuccess: () => { setModalOpen(false); reset({ payment_date: todayLocalDate() }) },
    })
  }

  const onSubmitRate = (data: RateChangeForm) => {
    createRateChange.mutate(data, {
      onSuccess: () => { setRateModalOpen(false); rateForm.reset({ effective_date: todayLocalDate() }) },
    })
  }

  if (isLoading) return <Loading />

  if (!debt) {
    return (
        <Card>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Deuda no encontrada</p>
        </Card>
    )
  }

  const statusColor = DEBT_STATUSES.find((s) => s.value === debt.status)?.color as any || 'gray'
  const paidAmount = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0)
  // Backend balance already includes accrued interest.
  const remaining = Number(debt.remaining_amount ?? Number(debt.original_amount) - paidAmount)
  const hasInterest = debt.interest_type !== 'none'
  const currentRate = Number(debt.current_rate ?? debt.interest_rate)
  const initialRateRow = { id: 'initial', effective_date: debt.origin_date, rate: Number(debt.interest_rate) }

  return (
    <div>
      <Link to={ROUTES.DEBTS} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 dark:text-gray-400 dark:hover:text-gray-300">
        <FiArrowLeft size={16} /> Volver a deudas
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{debt.description}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{debt.counterparty_name}</p>
        </div>
        <Badge color={statusColor}>{DEBT_STATUSES.find((s) => s.value === debt.status)?.label || debt.status}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monto Original</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(debt.original_amount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pagado</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">{hasInterest ? 'Saldo a hoy (con interés)' : 'Saldo Pendiente'}</p>
          <p className={`text-xl font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(Math.max(0, remaining))}
          </p>
        </Card>
      </div>

      {hasInterest && (
        <Card className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Interés</h2>
            <div className="flex gap-2">
              <Badge color="indigo">{interestTypeLabel(debt.interest_type)}</Badge>
              <Badge color={debt.rate_type === 'variable' ? 'yellow' : 'blue'}>{rateTypeLabel(debt.rate_type)}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Tasa vigente</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatRate(currentRate, debt.rate_period)}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Capital pendiente</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(debt.principal_remaining ?? 0))}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Interés por pagar</p>
              <p className="font-semibold text-red-600">{formatCurrency(Number(debt.accrued_interest ?? 0))}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Interés generado en total</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(debt.total_interest ?? 0))}</p>
            </div>
            {debt.projected_total_at_due != null && debt.due_date && (
              <div className="col-span-2 sm:col-span-2">
                <p className="text-gray-500 dark:text-gray-400">Total proyectado al vencimiento ({formatDate(debt.due_date)})</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(debt.projected_total_at_due))}</p>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Los pagos se aplican primero al interés acumulado y luego al capital.
          </p>
        </Card>
      )}

      {isVariable && (
        <Card className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historial de tasa</h2>
            {debt.status !== 'paid' && debt.status !== 'cancelled' && (
              <Button size="sm" variant="secondary" onClick={() => setRateModalOpen(true)}>
                <FiPlus size={16} className="mr-1" /> Cambiar tasa
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {[initialRateRow, ...(rateChanges || [])].map((change) => (
              <div key={change.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatRate(change.rate, debt.rate_period)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {change.id === 'initial' ? 'Tasa inicial · ' : 'Desde '}{formatDate(change.effective_date)}
                  </p>
                </div>
                {change.id !== 'initial' && (
                  <button
                    type="button"
                    aria-label="Eliminar cambio de tasa"
                    disabled={deleteRateChange.isPending}
                    onClick={() => { if (window.confirm('¿Eliminar este cambio de tasa? El interés se recalculará.')) deleteRateChange.mutate(change.id) }}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Registra aquí cada vez que cambie la tasa de referencia; el interés se calcula por tramos.
          </p>
        </Card>
      )}

      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detalles</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Tipo</p>
            <p className="font-medium dark:text-gray-200">{debt.type === 'receivable' ? 'Por cobrar' : 'Por pagar'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Fecha de origen</p>
            <p className="font-medium dark:text-gray-200">{formatDate(debt.origin_date)}</p>
          </div>
          {debt.due_date && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Vencimiento</p>
              <p className="font-medium dark:text-gray-200">{formatDate(debt.due_date)}</p>
            </div>
          )}
          {debt.notes && (
            <div className="col-span-2">
              <p className="text-gray-500 dark:text-gray-400">Notas</p>
              <p className="font-medium dark:text-gray-200">{debt.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pagos</h2>
          {debt.status !== 'paid' && debt.status !== 'cancelled' && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <FiPlus size={16} className="mr-1" /> Registrar Pago
            </Button>
          )}
        </div>

        {payments && payments.length > 0 ? (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.description || 'Pago'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(payment.payment_date)}</p>
                  </div>
                  {payment.expense_id && (
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                      Gasto
                    </span>
                  )}
                </div>
                <p className="font-semibold text-green-600">{formatCurrency(payment.amount)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-6">Sin pagos registrados</p>
        )}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Pago" size="lg">
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
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setValue('amount', Math.round(remaining * 100) / 100, { shouldValidate: true })}
              className="-mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Pagar todo el saldo ({formatCurrency(remaining)})
            </button>
          )}
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
          <Select
            id="category_id"
            label="Categoría de gasto (opcional)"
            placeholder="Sin categoría"
            options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
            {...register('category_id')}
          />
          <Button type="submit" loading={createPayment.isPending} className="w-full">
            Registrar Pago
          </Button>
        </form>
      </Modal>

      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title="Cambiar tasa" size="lg">
        <form onSubmit={rateForm.handleSubmit(onSubmitRate)} className="space-y-4">
          <Input
            id="rate_effective_date"
            label="Vigente desde"
            type="date"
            error={rateForm.formState.errors.effective_date?.message}
            {...rateForm.register('effective_date')}
          />
          <Input
            id="rate_value"
            label={`Nueva tasa (${debt.rate_period === 'annual' ? '% anual' : '% mensual'})`}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="Ej: 9.5"
            error={rateForm.formState.errors.rate?.message}
            {...rateForm.register('rate', { valueAsNumber: true })}
          />
          <Button type="submit" loading={createRateChange.isPending} className="w-full">
            Guardar cambio
          </Button>
        </form>
      </Modal>
    </div>
  )
}
