import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { expensesApi, categoriesApi } from './api'
import { getCurrentYear, getCurrentMonth } from '../../utils/format'

export function useExpenses(year?: number, month?: number) {
  const y = year || getCurrentYear()
  const m = month || getCurrentMonth()

  return useQuery({
    queryKey: ['expenses', y, m],
    queryFn: () => expensesApi.list(y, m),
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useUpdateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../../types/models').Expense> }) =>
      expensesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: expensesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useCategories(activeOnly?: boolean) {
  return useQuery({
    queryKey: ['expense-categories', activeOnly],
    queryFn: () => categoriesApi.list(activeOnly),
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
