import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { useCreateExpense, useCategories } from '../../expenses/hooks'
import { todayLocalDate, getCurrentMonth, getCurrentYear } from '../../../utils/format'
import type { Card } from '../../../types/models'

const schema = z.object({
  category_id: z.string().min(1, 'Selecciona una categoría'),
  amount: z.number({ message: 'Ingresa un monto' }).positive('El monto debe ser mayor a 0'),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  expense_date: z.string().min(1, 'Fecha requerida'),
})

type FormValues = z.infer<typeof schema>

interface CardPurchaseModalProps {
  card: Card | null
  /** Month being viewed; the date defaults to it when it is not the current one. */
  year: number
  month: number
  onClose: () => void
}

/** Today when viewing the current month, otherwise the first day of the viewed month. */
function defaultDate(year: number, month: number): string {
  if (year === getCurrentYear() && month === getCurrentMonth()) return todayLocalDate()
  return `${year}-${String(month).padStart(2, '0')}-01`
}

export function CardPurchaseModal({ card, year, month, onClose }: CardPurchaseModalProps) {
  if (!card) return null
  return <CardPurchaseForm key={card.id} card={card} year={year} month={month} onClose={onClose} />
}

function CardPurchaseForm({ card, year, month, onClose }: Required<CardPurchaseModalProps> & { card: Card }) {
  const { data: categories } = useCategories(true)
  const createExpense = useCreateExpense()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { expense_date: defaultDate(year, month) },
  })

  const onSubmit = (data: FormValues) => {
    createExpense.mutate(
      { ...data, card_id: card.id, payment_method: 'credit_card' },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal isOpen onClose={onClose} title={`Compra con ${card.name}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="purchase_description"
          label="¿Qué compraste?"
          placeholder="Ej: Supermercado, gasolina…"
          error={errors.description?.message}
          {...register('description')}
        />
        <Input
          id="purchase_amount"
          label="Monto"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0"
          error={errors.amount?.message}
          {...register('amount', { valueAsNumber: true })}
        />
        <Select
          id="purchase_category"
          label="Categoría"
          placeholder="Seleccionar"
          options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
          error={errors.category_id?.message}
          {...register('category_id')}
        />
        <Input id="purchase_date" label="Fecha" type="date" error={errors.expense_date?.message} {...register('expense_date')} />
        <Button type="submit" loading={createExpense.isPending} className="w-full min-h-11">
          Registrar compra
        </Button>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Se guarda como un gasto y descuenta de tu disponible.
        </p>
      </form>
    </Modal>
  )
}
