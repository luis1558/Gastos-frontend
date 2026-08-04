import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { expensesApi, categoriesApi } from './api'
import { getCurrentYear, getCurrentMonth } from '../../utils/format'
import type { Expense } from '../../types/models'

export function useExpenses(year?: number, month?: number) {
  const y = year || getCurrentYear()
  const m = month || getCurrentMonth()

  return useQuery({
    queryKey: ['expenses', y, m],
    queryFn: () => expensesApi.list(y, m),
    placeholderData: keepPreviousData,
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      toast.success('Gasto registrado')
      qc.invalidateQueries({ queryKey: ['expenses'] })
    },
    onError: () => toast.error('Error al registrar el gasto'),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      expensesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistically remove from current view when moving to a different period
      if (data.period_month !== undefined || data.period_year !== undefined) {
        await qc.cancelQueries({ queryKey: ['expenses'] })
        const snapshots = qc.getQueriesData<Expense[]>({ queryKey: ['expenses'] })
        qc.setQueriesData<Expense[]>({ queryKey: ['expenses'] }, (old) =>
          old?.filter((e) => e.id !== id) ?? old,
        )
        return { snapshots }
      }
    },
    onSuccess: (_data, variables) => {
      const isMoved = (variables.data.period_month !== undefined || variables.data.period_year !== undefined) && variables.data.amount === undefined
      const isEdited = variables.data.amount !== undefined
      toast.success(isMoved ? 'Gasto movido' : isEdited ? 'Gasto editado' : 'Gasto actualizado')
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Error al actualizar el gasto')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.delete,
    onMutate: async (expenseId) => {
      await qc.cancelQueries({ queryKey: ['expenses'] })
      const snapshots = qc.getQueriesData<Expense[]>({ queryKey: ['expenses'] })
      qc.setQueriesData<Expense[]>({ queryKey: ['expenses'] }, (old) =>
        old?.filter((e) => e.id !== expenseId) ?? old,
      )
      return { snapshots }
    },
    onSuccess: () => toast.success('Gasto eliminado'),
    onError: (_err, _id, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
      toast.error('Error al eliminar el gasto')
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useCategories(activeOnly?: boolean) {
  return useQuery({
    queryKey: ['expense-categories', activeOnly],
    queryFn: () => categoriesApi.list(activeOnly),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../../types/models').ExpenseCategory> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] }),
  })
}
