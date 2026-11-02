import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { ChoiceCards } from '../../../components/ui/ChoiceCards'
import { useCategories } from '../../expenses/hooks'
import type { Card } from '../../../types/models'
import { useCreateCard, useUpdateCard, useDeleteCard } from '../hooks'

const schema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    last_four: z.string().regex(/^(\d{4})?$/, 'Deben ser 4 números').optional(),
    payment_day: z
      .number({ message: 'Ingresa un día' })
      .int('Debe ser un número entero')
      .min(1, 'Entre 1 y 31')
      .max(31, 'Entre 1 y 31'),
    tracks_purchases: z.boolean(),
    category_id: z.string().optional(),
    notes: z.string().optional(),
    is_active: z.boolean(),
  })
  .refine((data) => data.tracks_purchases || !!data.category_id, {
    path: ['category_id'],
    message: 'Selecciona una categoría',
  })

type FormValues = z.infer<typeof schema>

const TRACKING = [
  { value: 'payment_only', label: 'Solo registro el pago', description: 'Al pagar la tarjeta se crea un gasto.' },
  { value: 'purchases', label: 'Registro cada compra', description: 'Al pagar no se crea otro gasto, para no contarlo dos veces.' },
] as const

interface CardFormModalProps {
  isOpen: boolean
  onClose: () => void
  /** When present the modal edits this card; otherwise it creates a new one. */
  card?: Card | null
  year: number
  month: number
}

export function CardFormModal({ isOpen, onClose, card, year, month }: CardFormModalProps) {
  if (!isOpen) return null
  return <CardForm onClose={onClose} card={card} year={year} month={month} />
}

function CardForm({ onClose, card, year, month }: Omit<CardFormModalProps, 'isOpen'>) {
  const editing = !!card
  const { data: categories } = useCategories(true)
  const createCard = useCreateCard()
  const updateCard = useUpdateCard(year, month)
  const deleteCard = useDeleteCard()

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: card?.name ?? '',
      last_four: card?.last_four ?? '',
      payment_day: card?.payment_day,
      tracks_purchases: card?.tracks_purchases ?? false,
      category_id: card?.category_id ?? '',
      notes: card?.notes ?? '',
      is_active: card?.is_active ?? true,
    },
  })
  const tracksPurchases = useWatch({ control, name: 'tracks_purchases' })

  const onSubmit = (data: FormValues) => {
    const base = {
      name: data.name,
      last_four: data.last_four || null,
      payment_day: data.payment_day,
      tracks_purchases: data.tracks_purchases,
      category_id: data.tracks_purchases ? null : data.category_id || null,
      notes: data.notes || null,
    }
    if (card) {
      updateCard.mutate({ id: card.id, data: { ...base, is_active: data.is_active } }, { onSuccess: onClose })
    } else {
      createCard.mutate(base, { onSuccess: onClose })
    }
  }

  const onDelete = () => {
    if (!card) return
    if (window.confirm('¿Eliminar esta tarjeta y sus montos? Los gastos que ya registró se conservan.')) {
      deleteCard.mutate(card.id, { onSuccess: onClose })
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={editing ? 'Editar tarjeta' : 'Nueva tarjeta'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="card_name"
          label="Nombre de la tarjeta"
          placeholder="Ej: Visa Bancolombia"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="card_last_four"
            label="Últimos 4 dígitos (opcional)"
            inputMode="numeric"
            maxLength={4}
            placeholder="1234"
            error={errors.last_four?.message}
            {...register('last_four')}
          />
          <Input
            id="card_payment_day"
            label="Día de pago"
            type="number"
            inputMode="numeric"
            min="1"
            max="31"
            placeholder="Ej: 15"
            error={errors.payment_day?.message}
            {...register('payment_day', { valueAsNumber: true })}
          />
        </div>

        <ChoiceCards
          label="¿Cómo llevas esta tarjeta?"
          value={tracksPurchases ? 'purchases' : 'payment_only'}
          options={TRACKING}
          onChange={(value) => setValue('tracks_purchases', value === 'purchases', { shouldValidate: true })}
        />

        {!tracksPurchases && (
          <Select
            id="card_category"
            label="Categoría del gasto al pagar"
            placeholder="Seleccionar"
            options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
            error={errors.category_id?.message}
            {...register('category_id')}
          />
        )}

        <Input id="card_notes" label="Notas (opcional)" placeholder="Algo que quieras recordar" {...register('notes')} />

        {editing && (
          <label className="flex min-h-11 items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" {...register('is_active')} />
            Activa (si la pausas, deja de aparecer como pendiente)
          </label>
        )}

        <Button type="submit" loading={createCard.isPending || updateCard.isPending} className="w-full min-h-11">
          {editing ? 'Guardar cambios' : 'Crear tarjeta'}
        </Button>
        {editing && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleteCard.isPending}
            className="min-h-11 w-full text-sm text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400"
          >
            Eliminar tarjeta
          </button>
        )}
      </form>
    </Modal>
  )
}
