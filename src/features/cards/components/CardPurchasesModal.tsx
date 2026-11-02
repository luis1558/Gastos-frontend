import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { Loading } from '../../../components/ui/Loading'
import { formatCurrency, formatDate, formatMonthYear } from '../../../utils/format'
import type { Card } from '../../../types/models'
import { useCardPurchases } from '../hooks'

interface CardPurchasesModalProps {
  card: Card | null
  year: number
  month: number
  onClose: () => void
  onAdd: (card: Card) => void
}

export function CardPurchasesModal({ card, year, month, onClose, onAdd }: CardPurchasesModalProps) {
  const { data: purchases, isLoading } = useCardPurchases(card?.id, year, month)
  if (!card) return null

  const total = (purchases ?? []).reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <Modal isOpen onClose={onClose} title={`Compras · ${card.name}`} size="lg">
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">{formatMonthYear(year, month)}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatCurrency(total)}</p>
        </div>

        {isLoading ? (
          <Loading />
        ) : purchases && purchases.length > 0 ? (
          <div className="space-y-1">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{purchase.description}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(purchase.expense_date)} · {purchase.category_name}
                  </p>
                </div>
                <p className="shrink-0 font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(purchase.amount))}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-gray-500 dark:text-gray-400">Aún no hay compras registradas este mes</p>
        )}

        <Button className="w-full min-h-11" onClick={() => onAdd(card)}>
          Registrar compra
        </Button>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Para editar o borrar una compra, hazlo desde Gastos.
        </p>
      </div>
    </Modal>
  )
}
