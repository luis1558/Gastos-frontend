import { useState } from 'react'
import { FiPlus, FiEdit2, FiChevronLeft, FiChevronRight, FiRepeat, FiCheck } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency, formatDate, formatMonthYear, getCurrentMonth, getCurrentYear, todayLocalDate } from '../../../utils/format'
import type { FixedPayment } from '../../../types/models'
import { useFixedPayments, useUndoFixedPayment } from '../hooks'
import { FixedPaymentFormModal } from '../components/FixedPaymentFormModal'
import { PayFixedPaymentModal } from '../components/PayFixedPaymentModal'

export function FixedPaymentsPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [month, setMonth] = useState(getCurrentMonth())
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<FixedPayment | null>(null)
  const [paying, setPaying] = useState<FixedPayment | null>(null)

  const { data: payments, isLoading } = useFixedPayments(year, month)
  const undo = useUndoFixedPayment()

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1)
    setYear(next.getFullYear())
    setMonth(next.getMonth() + 1)
  }

  const today = todayLocalDate()
  // Spanish month names come lowercase; capitalise only the first letter (CSS `capitalize` would turn "de" into "De").
  const rawLabel = formatMonthYear(year, month)
  const monthLabel = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1)
  const active = (payments ?? []).filter((p) => p.is_active)
  const paused = (payments ?? []).filter((p) => !p.is_active)
  const pending = active.filter((p) => p.status === 'pending')
  const pendingTotal = pending.reduce((sum, p) => sum + Number(p.amount), 0)
  const paidTotal = active.reduce((sum, p) => sum + Number(p.paid_amount ?? 0), 0)

  const onUndo = (payment: FixedPayment) => {
    if (window.confirm(`¿Deshacer el pago de ${payment.name}? Se eliminará el gasto que se registró.`)) {
      undo.mutate({ id: payment.id, year, month })
    }
  }

  const renderCard = (payment: FixedPayment) => {
    const paid = payment.status === 'paid'
    const overdue = !paid && payment.is_active && payment.due_date < today
    return (
      <Card key={payment.id} className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="break-words font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{payment.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{payment.category_name}</p>
          </div>
          {!payment.is_active ? (
            <Badge color="gray">Pausado</Badge>
          ) : paid ? (
            <Badge color="green">Pagado</Badge>
          ) : overdue ? (
            <Badge color="red">Vencido</Badge>
          ) : (
            <Badge color="yellow">Pendiente</Badge>
          )}
          <button
            type="button"
            aria-label={`Editar ${payment.name}`}
            onClick={() => setEditing(payment)}
            className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <FiEdit2 size={16} />
          </button>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(Number(paid ? payment.paid_amount : payment.amount))}
          </p>
          <p className={`text-sm ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {paid && payment.paid_on ? `Pagado el ${formatDate(payment.paid_on)}` : `Vence el ${formatDate(payment.due_date)}`}
          </p>
        </div>

        {payment.is_active &&
          (paid ? (
            <Button variant="ghost" className="w-full min-h-11" onClick={() => onUndo(payment)} disabled={undo.isPending}>
              Deshacer pago
            </Button>
          ) : (
            <Button className="w-full min-h-11" onClick={() => setPaying(payment)}>
              <FiCheck size={16} className="mr-1.5" /> Marcar como pagado
            </Button>
          ))}
      </Card>
    )
  }

  return (
    <div>
      <PageHeader
        title="Pagos fijos"
        action={
          <Button onClick={() => setCreating(true)} size="sm" className="min-h-11 sm:min-h-0">
            <FiPlus size={16} className="mr-1" /> Nuevo pago fijo
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
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Por pagar</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(pendingTotal)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{pending.length} {pending.length === 1 ? 'pendiente' : 'pendientes'}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pagado</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(paidTotal)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{active.length - pending.length} de {active.length}</p>
          </Card>
        </div>
      )}

      {isLoading ? (
        <Loading />
      ) : payments && payments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{active.map(renderCard)}</div>
          {paused.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Pausados</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{paused.map(renderCard)}</div>
            </>
          )}
        </>
      ) : (
        <Card>
          <EmptyState
            icon={<FiRepeat size={32} />}
            title="Aún no tienes pagos fijos"
            description="Registra lo que pagas cada mes (arriendo, internet, suscripciones) y marca cuándo lo pagas."
            action={
              <Button onClick={() => setCreating(true)}>
                <FiPlus size={16} className="mr-1" /> Crear mi primer pago fijo
              </Button>
            }
          />
        </Card>
      )}

      <FixedPaymentFormModal isOpen={creating} onClose={() => setCreating(false)} year={year} month={month} />
      <FixedPaymentFormModal isOpen={!!editing} onClose={() => setEditing(null)} fixedPayment={editing} year={year} month={month} />
      <PayFixedPaymentModal fixedPayment={paying} year={year} month={month} onClose={() => setPaying(null)} />
    </div>
  )
}
