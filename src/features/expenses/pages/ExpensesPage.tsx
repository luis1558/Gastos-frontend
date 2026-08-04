import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, useCategories } from '../hooks'
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
import { FiPlus, FiTrash2, FiSettings, FiCalendar, FiTag, FiEdit2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import type { Expense } from '../../../types/models'

const expenseSchema = z.object({
  category_id: z.string().min(1, 'Selecciona una categoría'),
  amount: z.number().positive('Monto debe ser mayor a 0'),
  description: z.string().min(2, 'Mínimo 2 caracteres'),
  expense_date: z.string().min(1, 'Fecha requerida'),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
  period_month: z.number().int().min(1).max(12),
  period_year: z.number().int().min(2000).max(2100),
})

type ExpenseForm = z.infer<typeof expenseSchema>

export function ExpensesPage() {
  const [year, setYear] = useState(getCurrentYear())
  const [month, setMonth] = useState(getCurrentMonth())
  const [modalOpen, setModalOpen] = useState(false)
  const [movingExpense, setMovingExpense] = useState<{ id: string; description: string; month: number; year: number } | null>(null)
  const [moveMonth, setMoveMonth] = useState(month)
  const [moveYear, setMoveYear] = useState(year)
  const [changingCategoryExpense, setChangingCategoryExpense] = useState<{ id: string; description: string; category_id: string } | null>(null)
  const [newCategoryId, setNewCategoryId] = useState('')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)

  const { data: expenses, isLoading } = useExpenses(year, month)
  const { data: categories } = useCategories(true)
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()

  const openMoveModal = (expense: { id: string; description: string; month: number; year: number }) => {
    setMoveMonth(expense.month)
    setMoveYear(expense.year)
    setMovingExpense(expense)
  }

  const openChangeCategoryModal = (expense: { id: string; description: string; category_id: string }) => {
    setNewCategoryId(expense.category_id)
    setChangingCategoryExpense(expense)
  }

  const handleChangeCategory = () => {
    if (!changingCategoryExpense || !newCategoryId) return
    updateExpense.mutate(
      { id: changingCategoryExpense.id, data: { category_id: newCategoryId } },
      { onSuccess: () => setChangingCategoryExpense(null) },
    )
  }

  const handleMove = () => {
    if (!movingExpense) return
    updateExpense.mutate(
      { id: movingExpense.id, data: { period_month: moveMonth, period_year: moveYear } },
      { onSuccess: () => setMovingExpense(null) },
    )
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { period_month: month, period_year: year },
  })

  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors } } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
  })

  const openModal = () => {
    reset({ period_month: month, period_year: year })
    setModalOpen(true)
  }

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense)
    resetEdit({
      category_id: expense.category_id,
      amount: expense.amount,
      description: expense.description,
      expense_date: expense.expense_date.slice(0, 10),
      payment_method: expense.payment_method || '',
      notes: expense.notes || '',
      period_month: expense.period_month || expense.month,
      period_year: expense.period_year || expense.year,
    })
  }

  const onEditSubmit = (data: ExpenseForm) => {
    if (!editingExpense) return
    updateExpense.mutate(
      { id: editingExpense.id, data: data as any },
      { onSuccess: () => setEditingExpense(null) },
    )
  }

  const handleDelete = () => {
    if (!deletingExpenseId) return
    deleteExpense.mutate(deletingExpenseId, {
      onSuccess: () => setDeletingExpenseId(null),
    })
  }

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
            <Button onClick={openModal} size="sm">
              <FiPlus size={16} className="mr-1" /> Nuevo Gasto
            </Button>
          </div>
        }
      />

        <div className="flex gap-2 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          >
            {MONTH_NAMES.slice(1).map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
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
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{expense.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{expense.category_name || expense.category_slug}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(expense.amount)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(expense.expense_date)}</p>
              </div>
              <button
                onClick={() => openEdit(expense)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors dark:hover:bg-indigo-900/30"
                title="Editar gasto"
              >
                <FiEdit2 size={16} />
              </button>
              <button
                onClick={() => openChangeCategoryModal({ id: expense.id, description: expense.description, category_id: expense.category_id })}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors dark:hover:bg-purple-900/30"
                title="Cambiar categoría"
              >
                <FiTag size={16} />
              </button>
              <button
                onClick={() => openMoveModal({ id: expense.id, description: expense.description, month: expense.month, year: expense.year })}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:hover:bg-blue-900/30"
                title="Mover a otro período"
              >
                <FiCalendar size={16} />
              </button>
              <button
                onClick={() => setDeletingExpenseId(expense.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/30"
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
            action={<Button onClick={openModal}><FiPlus size={16} className="mr-1" /> Registrar Gasto</Button>}
          />
        </Card>
      )}

      <Modal isOpen={!!changingCategoryExpense} onClose={() => setChangingCategoryExpense(null)} title="Cambiar categoría">
        {changingCategoryExpense && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">{changingCategoryExpense.description}</span>
              {' '}se moverá a la categoría que selecciones.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nueva categoría
              </label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleChangeCategory}
              loading={updateExpense.isPending}
              disabled={newCategoryId === changingCategoryExpense.category_id}
              className="w-full"
            >
              Cambiar categoría
            </Button>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!movingExpense} onClose={() => setMovingExpense(null)} title="Mover a otro período">
        {movingExpense && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-100">{movingExpense.description}</span>
              {' '}se moverá al período que selecciones.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nuevo período
              </label>
              <div className="flex gap-2">
                <select
                  value={moveMonth}
                  onChange={(e) => setMoveMonth(Number(e.target.value))}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                >
                  {MONTH_NAMES.slice(1).map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                  ))}
                </select>
                <select
                  value={moveYear}
                  onChange={(e) => setMoveYear(Number(e.target.value))}
                  className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                >
                  {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={handleMove} loading={updateExpense.isPending} className="w-full">
              Mover gasto
            </Button>
          </div>
        )}
      </Modal>

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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Período de imputación
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Mes y año al que pertenece este gasto (puede diferir de la fecha real).
            </p>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                {...register('period_month', { valueAsNumber: true })}
              >
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
              <select
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                {...register('period_year', { valueAsNumber: true })}
              >
                {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" loading={createExpense.isPending} className="w-full">
            Guardar Gasto
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="Editar Gasto">
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
          <Select
            id="edit_category_id"
            label="Categoría"
            options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Seleccionar"
            error={editErrors.category_id?.message}
            {...registerEdit('category_id')}
          />
          <Input
            id="edit_amount"
            label="Monto"
            type="number"
            step="0.01"
            placeholder="0"
            error={editErrors.amount?.message}
            {...registerEdit('amount', { valueAsNumber: true })}
          />
          <Input
            id="edit_description"
            label="Descripción"
            placeholder="¿En qué gastaste?"
            error={editErrors.description?.message}
            {...registerEdit('description')}
          />
          <Input
            id="edit_expense_date"
            label="Fecha"
            type="date"
            error={editErrors.expense_date?.message}
            {...registerEdit('expense_date')}
          />
          <Select
            id="edit_payment_method"
            label="Método de pago"
            options={PAYMENT_METHODS.map((pm) => ({ value: pm.value, label: pm.label }))}
            placeholder="Seleccionar (opcional)"
            {...registerEdit('payment_method')}
          />
          <Input
            id="edit_notes"
            label="Notas (opcional)"
            placeholder="Notas adicionales"
            {...registerEdit('notes')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Período de imputación
            </label>
            <div className="flex gap-2">
              <select
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                {...registerEdit('period_month', { valueAsNumber: true })}
              >
                {MONTH_NAMES.slice(1).map((name, i) => (
                  <option key={i + 1} value={i + 1}>{name}</option>
                ))}
              </select>
              <select
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                {...registerEdit('period_year', { valueAsNumber: true })}
              >
                {Array.from({ length: 5 }, (_, i) => getCurrentYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" loading={updateExpense.isPending} className="w-full">
            Guardar cambios
          </Button>
        </form>
      </Modal>

      <Modal isOpen={!!deletingExpenseId} onClose={() => setDeletingExpenseId(null)} title="Eliminar gasto">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Estás seguro que querés eliminar este gasto? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setDeletingExpenseId(null)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              loading={deleteExpense.isPending}
              className="flex-1 !bg-red-600 hover:!bg-red-700"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
