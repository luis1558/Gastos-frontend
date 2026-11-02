import { forwardRef, type SelectHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { Select } from '../../../components/ui/Select'
import { ROUTES } from '../../../utils/constants'
import { getCurrentMonth, getCurrentYear } from '../../../utils/format'
import { useCards } from '../hooks'

interface CardSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  /** The card field only applies to credit card purchases. */
  paymentMethod?: string
}

/** Lets an expense be linked to one of the cards that track their purchases. */
export const CardSelect = forwardRef<HTMLSelectElement, CardSelectProps>(({ id, paymentMethod, ...props }, ref) => {
  const { data: cards } = useCards(getCurrentYear(), getCurrentMonth())
  if (paymentMethod !== 'credit_card') return null

  const trackable = (cards ?? []).filter((c) => c.is_active && c.tracks_purchases)

  if (trackable.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
        Para ligar esta compra a una tarjeta, crea una en{' '}
        <Link to={ROUTES.CARDS} className="font-medium text-indigo-600 underline dark:text-indigo-400">
          Tarjetas
        </Link>{' '}
        con la opción «Registro cada compra».
      </p>
    )
  }

  return (
    <Select
      id={id}
      ref={ref}
      label="Tarjeta (opcional)"
      placeholder="Sin tarjeta específica"
      options={trackable.map((c) => ({ value: c.id, label: c.last_four ? `${c.name} ····${c.last_four}` : c.name }))}
      {...props}
    />
  )
})

CardSelect.displayName = 'CardSelect'
