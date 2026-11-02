import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { useCategories } from '../../expenses/hooks'
import type { FixedPayment } from '../../../types/models'
import { useCreateFixedPayment, useUpdateFixedPayment, useDeleteFixedPayment } from '../hooks'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  amount: z.number({ message: 'Ingresa un monto' }).positive('El monto debe ser mayor a 0'),
  day_of_month: z
    .number({ message: 'Ingresa un día' })
    .int('Debe ser un número entero')
    .min(1, 'Entre 1 y 31')
    .max(31, 'Entre 1 y 31'),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface FixedPaymentFormModalProps {
  isOpen: boolean
  onClose: () => void
  /** When present the modal edits this payment; otherwise it creates a new one. */
  fixedPayment?: FixedPayment | null
  year: number
  month: number
}

export function FixedPaymentFormModal({ isOpen, onClose, fixedPayment, year, month }: FixedPaymentFormModalProps) {
  if (!isOpen) return null
  return <FixedPaymentForm onClose={onClose} fixedPayment={fixedPayment} year={year} month={month} />
}

function FixedPaymentForm({ onClose, fixedPayment, year, month }: Omit<FixedPaymentFormModalProps, 'isOpen'>) {
  const editing = !!fixedPayment
  const { data: categories } = useCategories(true)
  const createPayment = useCreateFixedPayment()
  const updatePayment = useUpdateFixedPayment(year, month)
  const deletePayment = useDeleteFixedPayment()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: fixedPayment?.name ?? '',
      amount: fixedPayment ? Number(fixedPayment.amount) : undefined,
      day_of_month: fixedPayment?.day_of_month,
      category_id: fixedPayment?.category_id ?? '',
      notes: fixedPayment?.notes ?? '',
      is_active: fixedPayment?.is_active ?? true,
    },
  })

  const onSubmit = (data: FormValues) => {
    const base = {
      name: data.name,
      amount: data.amount,
      day_of_month: data.day_of_month,
      category_id: data.category_id,
      notes: data.notes || null,
    }
    if (fixedPayment) {
      updatePayment.mutate({ id: fixedPayment.id, data: { ...base, is_active: data.is_active } }, { onSuccess: onClose })
    } else {
      createPayment.mutate(base, { onSuccess: onClose })
    }
  }

  const onDelete = () => {
    if (!fixedPayment) return
    if (window.confirm('¿Eliminar este pago fijo? Los gastos que ya registró se conservan.')) {
      deletePayment.mutate(fixedPayment.id, { onSuccess: onClose })
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={editing ? 'Editar pago fijo' : 'Nuevo pago fijo'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="fp_name"
          label="¿Qué pagas?"
          placeholder="Ej: Arriendo, internet, Netflix…"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="fp_amount"
          label="Monto mensual"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <div>
          <Input
            id="fp_day"
            label="Día del mes en que vence"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            placeholder="Ej: 5"
            error={errors.day_of_month?.message}
            {...register('day_of_month', { valueAsNumber: true })}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            En meses más cortos se usa el último día (el 31 pasa al 28, 29 o 30).
          </p>
        </div>
        <div>
          <Select
            id="fp_category"
            label="Categoría del gasto"
            placeholder="Seleccionar"
            options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
            error={errors.category_id?.message}
            {...register('category_id')}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Al marcarlo como pagado se registrará un gasto en esta categoría.
          </p>
        </div>
        <Input id="fp_notes" label="Notas (opcional)" placeholder="Algo que quieras recordar" {...register('notes')} />

        {editing && (
          <label className="flex min-h-11 items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" {...register('is_active')} />
            Activo (si lo pausas, deja de aparecer como pendiente)
          </label>
        )}

        <Button type="submit" loading={createPayment.isPending || updatePayment.isPending} className="w-full min-h-11">
          {editing ? 'Guardar cambios' : 'Crear pago fijo'}
        </Button>
        {editing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePayment.isPending}
            className="min-h-11 w-full text-sm text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
          >
            Eliminar pago fijo
          </button>
        )}
      </form>
    </Modal>
  )
}
