import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useExpenses, useCreateExpense, useDeleteExpense, useCategories } from '../hooks'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Modal } from '../../../components/ui/Modal'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { formatCurrency, formatDate, getCurrentYear, getCurrentMonth } from '../../../utils/format'
import { MONTH_NAMES, PAYMENT_METHODS, ROUTES } from '../../../utils/constants'
import { FiPlus, FiTrash2, FiSettings } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const expenseSchema = z.object({
  category_id: z.string().min(1, 'Selecciona una categoría'),
  amount: z.number().positive('Monto debe ser mayor a 0'),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  expense_date: z.string().min(1, 'Fecha requerida'),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
})

type ExpenseForm = z.infer<typeof expenseSchema>

export function ExpensesPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [month, setMonth] = useState(getCurrentMonth())
  const [modalOpen, setModalOpen] = useState(false)

  const { data: expenses, isLoading } = useExpenses(year, month)
  const { data: categories } = useCategories(true)
  const createExpense = useCreateExpense()
  const deleteExpense = useDeleteExpense()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
  })

  const onSubmit = (data: ExpenseForm) => {
    createExpense.mutate(data as any, {
      onSuccess: () => {
        setModalOpen(false)
        reset()
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Gastos"
        description={`${MONTH_NAMES[month]} ${year}`}
        action={
          <div className="flex gap-2">
            <Link to={ROUTES.EXPENSES_CATEGORIES}>
              <Button variant="ghost" size="sm">
                <FiSettings size={16} />
              </Button>
            </Link>
            <Button onClick={() => setModalOpen(true)} size="sm">
              <FiPlus size={16} className="mr-1" /> Nuevo Gasto
            </Button>
          </div>
        }
      />

      <div className="flex gap-2 mb-6">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white"
        >
          {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Loading />
      ) : expenses && expenses.length > 0 ? (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card key={expense.id} className="flex items-center gap-4">
              <div
                className="w-1 h-12 rounded-full shrink-0"
                style={{ backgroundColor: expense.category_slug === 'arriendo' ? '#6366f1' : '#94a3b8' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                <p className="text-sm text-gray-500">{expense.category_name || expense.category_slug}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                <p className="text-xs text-gray-400">{formatDate(expense.expense_date)}</p>
              </div>
              <button
                onClick={() => deleteExpense.mutate(expense.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="Sin gastos"
            description={`No hay gastos registrados en ${MONTH_NAMES[month]} ${year}`}
            action={<Button onClick={() => setModalOpen(true)}><FiPlus size={16} className="mr-1" /> Registrar Gasto</Button>}
          />
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Gasto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            id="category_id"
            label="Categoría"
            options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Seleccionar"
            error={errors.category_id?.message}
            {...register('category_id')}
          />
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
            id="description"
            label="Descripción"
            placeholder="¿En qué gastaste?"
            error={errors.description?.message}
            {...register('description')}
          />
          <Input
            id="expense_date"
            label="Fecha"
            type="date"
            error={errors.expense_date?.message}
            {...register('expense_date')}
          />
          <Select
            id="payment_method"
            label="Método de pago"
            options={PAYMENT_METHODS.map((pm) => ({ value: pm.value, label: pm.label }))}
            placeholder="Seleccionar (opcional)"
            {...register('payment_method')}
          />
          <Input
            id="notes"
            label="Notas (opcional)"
            placeholder="Notas adicionales"
            {...register('notes')}
          />
          <Button type="submit" loading={createExpense.isPending} className="w-full">
            Guardar Gasto
          </Button>
        </form>
      </Modal>
    </div>
  )
}
