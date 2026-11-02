import { useState } from 'react'
import { FiPlus, FiEdit2, FiChevronLeft, FiChevronRight, FiLayers, FiCheck, FiShoppingCart } from 'react-icons/fi'
import { Card as UiCard } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency, formatDate, formatMonthYear, getCurrentMonth, getCurrentYear, todayLocalDate } from '../../../utils/format'
import type { Card } from '../../../types/models'
import { useCards, useUndoCardPayment } from '../hooks'
import { CardFormModal } from '../components/CardFormModal'
import { StatementModal } from '../components/StatementModal'
import { CardPurchaseModal } from '../components/CardPurchaseModal'
import { CardPurchasesModal } from '../components/CardPurchasesModal'
import { PayCardModal } from '../components/PayCardModal'

export function CardsPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [month, setMonth] = useState(getCurrentMonth())
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Card | null>(null)
  const [statementFor, setStatementFor] = useState<Card | null>(null)
  const [paying, setPaying] = useState<Card | null>(null)
  const [viewingPurchases, setViewingPurchases] = useState<Card | null>(null)
  const [addingPurchase, setAddingPurchase] = useState<Card | null>(null)

  const { data: cards, isLoading } = useCards(year, month)
  const undo = useUndoCardPayment()

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth() + 1)
  }

  const today = todayLocalDate()
  const active = (cards ?? []).filter((c) => c.is_active)
  const paused = (cards ?? []).filter((c) => !c.is_active)
  const pending = active.filter((c) => c.status === 'pending')
  const undefinedCount = active.filter((c) => c.status === 'undefined').length
  const pendingTotal = pending.reduce((sum, c) => sum + Number(c.statement_amount ?? 0), 0)
  const paidTotal = active.reduce((sum, c) => sum + (c.status === 'paid' ? Number(c.statement_amount ?? 0) : 0), 0)
  // Spanish month names come lowercase; capitalise only the first letter.
  const rawLabel = formatMonthYear(year, month)
  const monthLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)

  const onUndo = (card: Card) => {
    const extra = card.tracks_purchases ? '' : ' Se eliminará el gasto que se registró.'
    if (window.confirm(`¿Deshacer el pago de ${card.name}?${extra}`)) {
      undo.mutate({ id: card.id, year, month })
    }
  }

  const renderCard = (card: Card) => {
    const paid = card.status === 'paid'
    const known = card.status !== 'undefined'
    const overdue = card.status === 'pending' && card.is_active && card.due_date < today
    return (
      <UiCard key={card.id} className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="break-words font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{card.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.last_four ? `···· ${card.last_four} · ` : ''}
              {card.tracks_purchases ? 'Registro mis compras' : 'Solo registro el pago'}
            </p>
          </div>
          {!card.is_active ? (
            <Badge color="gray">Pausada</Badge>
          ) : paid ? (
            <Badge color="green">Pagada</Badge>
          ) : overdue ? (
            <Badge color="red">Vencida</Badge>
          ) : known ? (
            <Badge color="yellow">Pendiente</Badge>
          ) : (
            <Badge color="blue">Sin monto</Badge>
          )}
          <button
            type="button"
            aria-label={`Editar ${card.name}`}
            onClick={() => setEditing(card)}
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <FiEdit2 size={16} />
          </button>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {known ? formatCurrency(Number(card.statement_amount)) : 'Por definir'}
          </p>
          <p className={`text-sm ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {paid && card.paid_on ? `Pagada el ${formatDate(card.paid_on)}` : `Vence el ${formatDate(card.due_date)}`}
          </p>
        </div>

        {card.is_active && (
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            {card.tracks_purchases ? (
              <>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Compras del mes{card.purchases_count > 0 ? ` (${card.purchases_count})` : ''}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(card.purchases_total))}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button variant="secondary" size="sm" className="min-h-11 flex-1" onClick={() => setAddingPurchase(card)}>
                    <FiShoppingCart size={14} className="mr-1.5" /> Registrar compra
                  </Button>
                  <Button variant="ghost" size="sm" className="min-h-11" onClick={() => setViewingPurchases(card)}>
                    Ver compras
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Esta tarjeta solo registra el pago. Para anotar sus compras, cámbiala a «Registro cada compra».</p>
                <button
                  type="button"
                  onClick={() => setEditing(card)}
                  className="mt-1 min-h-11 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Cambiar cómo la llevo
                </button>
              </div>
            )}
          </div>
        )}

        {card.is_active &&
          (paid ? (
            <Button variant="ghost" className="w-full min-h-11" onClick={() => onUndo(card)} disabled={undo.isPending}>
              Deshacer pago
            </Button>
          ) : known ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="min-h-11 flex-1" onClick={() => setPaying(card)}>
                <FiCheck size={16} className="mr-1.5" /> Marcar como pagada
              </Button>
              <Button variant="secondary" className="min-h-11" onClick={() => setStatementFor(card)}>
                Cambiar monto
              </Button>
            </div>
          ) : (
            <Button className="w-full min-h-11" onClick={() => setStatementFor(card)}>
              Anotar monto del extracto
            </Button>
          ))}
      </UiCard>
    )
  }

  return (
    <div>
      <PageHeader
        title="Tarjetas"
        action={
          <Button onClick={() => setCreating(true)} size="sm" className="min-h-11 sm:min-h-0">
            <FiPlus size={16} className="mr-1" /> Nueva tarjeta
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => shiftMonth(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <FiChevronLeft size={18} />
        </button>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{monthLabel}</p>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => shiftMonth(1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      {active.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
          <UiCard>
            <p className="text-sm text-gray-500 dark:text-gray-400">Por pagar</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(pendingTotal)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {pending.length} {pending.length === 1 ? 'tarjeta' : 'tarjetas'}
              {undefinedCount > 0 ? ` · ${undefinedCount} sin monto` : ''}
            </p>
          </UiCard>
          <UiCard>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pagado</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(paidTotal)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {active.filter((c) => c.status === 'paid').length} de {active.length}
            </p>
          </UiCard>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : cards && cards.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{active.map(renderCard)}</div>
          {paused.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Pausadas</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{paused.map(renderCard)}</div>
            </>
          )}
        </>
      ) : (
        <UiCard>
          <EmptyState
            icon={<FiLayers size={32} />}
            title="Aún no tienes tarjetas"
            description="Registra tus tarjetas, anota el valor de cada extracto y marca cuándo las pagas."
            action={
              <Button onClick={() => setCreating(true)}>
                <FiPlus size={16} className="mr-1" /> Agregar mi primera tarjeta
              </Button>
            }
          />
        </UiCard>
      )}

      <CardFormModal isOpen={creating} onClose={() => setCreating(false)} year={year} month={month} />
      <CardFormModal isOpen={!!editing} onClose={() => setEditing(null)} card={editing} year={year} month={month} />
      <StatementModal card={statementFor} year={year} month={month} onClose={() => setStatementFor(null)} />
      <PayCardModal card={paying} year={year} month={month} onClose={() => setPaying(null)} />
      <CardPurchasesModal
        card={viewingPurchases}
        year={year}
        month={month}
        onClose={() => setViewingPurchases(null)}
        onAdd={(c) => {
          setViewingPurchases(null)
          setAddingPurchase(c)
        }}
      />
      <CardPurchaseModal card={addingPurchase} year={year} month={month} onClose={() => setAddingPurchase(null)} />
    </div>
  )
}
