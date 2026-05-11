import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useDebts, useCreateDebt, useDebtSummary, useCounterparties } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency } from '../../../utils/format'
import { DEBT_TYPES, DEBT_STATUSES, ROUTES } from '../../../utils/constants'
import { FiPlus, FiUsers, FiArrowRight } from 'react-icons/fi'

const debtSchema = z.object({
  counterparty_id: z.string().min(1, 'Selecciona una contraparte'),
  type: z.enum(['receivable', 'payable']),
  original_amount: z.number().positive('Monto debe ser mayor a 0'),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  origin_date: z.string().min(1, 'Fecha requerida'),
  due_date: z.string().optional(),
  notes: z.string().optional(),
})

type DebtForm = z.infer<typeof debtSchema>

export function DebtsListPage() {
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data: debts, isLoading } = useDebts(filterType || undefined, filterStatus || undefined)
  const { data: summary } = useDebtSummary()
  const { data: counterparties } = useCounterparties()
  const createDebt = useCreateDebt()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DebtForm>({
    resolver: zodResolver(debtSchema),
  })

  const onSubmit = (data: DebtForm) => {
    createDebt.mutate(data as any, {
      onSuccess: () => { setModalOpen(false); reset() },
    })
  }

  const getStatusBadge = (status: string) => {
    const s = DEBT_STATUSES.find((ds) => ds.value === status)
    return <Badge color={(s?.color as any) || 'gray'}>{s?.label || status}</Badge>
  }

  return (
    <div>
      <PageHeader
        title="Deudas"
        action={
          <div className="flex gap-2">
            <Link to={ROUTES.COUNTERPARTIES}>
              <Button variant="secondary" size="sm"><FiUsers size={16} className="mr-1" /> Contrapartes</Button>
            </Link>
            <Button onClick={() => setModalOpen(true)} size="sm"><FiPlus size={16} className="mr-1" /> Nueva Deuda</Button>
          </div>
        }
      />

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <p className="text-sm text-gray-500">Por cobrar</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(summary.total_receivable_pending)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Por pagar</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(summary.total_payable_pending)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Vencidas</p>
            <p className="text-lg font-bold text-yellow-600">{summary.overdue_receivable_count + summary.overdue_payable_count}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Activas</p>
            <p className="text-lg font-bold text-gray-900">{summary.active_debt_count}</p>
          </Card>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <Select
          options={[{ value: '', label: 'Todos' }, ...DEBT_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-40"
        />
        <Select
          options={[{ value: '', label: 'Todos' }, ...DEBT_STATUSES.map((s) => ({ value: s.value, label: s.label }))]}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : debts && debts.length > 0 ? (
        <div className="space-y-3">
          {debts.map((debt) => (
            <Link key={debt.id} to={ROUTES.DEBT_DETAIL(debt.id)}>
              <Card className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-1 h-14 rounded-full shrink-0 ${debt.type === 'receivable' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{debt.description}</p>
                  <p className="text-sm text-gray-500">{debt.counterparty_name || 'Sin contraparte'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(debt.original_amount)}</p>
                  {debt.remaining_amount !== undefined && debt.remaining_amount > 0 && (
                    <p className="text-xs text-gray-400">Restan: {formatCurrency(debt.remaining_amount)}</p>
                  )}
                </div>
                <div className="hidden sm:block">{getStatusBadge(debt.status)}</div>
                <FiArrowRight size={16} className="text-gray-300 shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Sin deudas"
            description="No tienes deudas registradas"
            action={<Button onClick={() => setModalOpen(true)}><FiPlus size={16} className="mr-1" /> Registrar Deuda</Button>}
          />
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Deuda">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            id="type"
            label="Tipo"
            options={DEBT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            placeholder="Seleccionar"
            error={errors.type?.message}
            {...register('type')}
          />
          <Select
            id="counterparty_id"
            label="Contraparte"
            options={(counterparties || []).map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Seleccionar"
            error={errors.counterparty_id?.message}
            {...register('counterparty_id')}
          />
          <Input
            id="original_amount"
            label="Monto"
            type="number"
            step="0.01"
            placeholder="0"
            error={errors.original_amount?.message}
            {...register('original_amount', { valueAsNumber: true })}
          />
          <Input
            id="description"
            label="Descripción"
            placeholder="¿Concepto de la deuda?"
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            id="origin_date"
            label="Fecha de origen"
            type="date"
            error={errors.origin_date?.message}
            {...register('origin_date')}
          />
          <Input
            id="due_date"
            label="Fecha de vencimiento (opcional)"
            type="date"
            {...register('due_date')}
          />
          <Input
            id="notes"
            label="Notas (opcional)"
            placeholder="Notas adicionales"
            {...register('notes')}
          />
          <Button type="submit" loading={createDebt.isPending} className="w-full">
            Guardar Deuda
          </Button>
        </form>
      </Modal>
    </div>
  )
}
