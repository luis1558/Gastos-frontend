import { api } from '../../api/client'
import type { Expense, ExpenseCategory } from '../../types/models'

export const expensesApi = {
  list: (year: number, month?: number) =>
    api.get<Expense[]>('/expenses', { year, month: month?.toString() }),

  create: (data: Partial<Expense>) => api.post<Expense>('/expenses', data),

  update: (id: string, data: Partial<Expense>) => api.patch<Expense>(`/expenses/${id}`, data),

  delete: (id: string) => api.delete<void>(`/expenses/${id}`),
}

export const categoriesApi = {
  list: (activeOnly?: boolean) =>
    api.get<ExpenseCategory[]>('/expense-categories', { active_only: activeOnly ? 'true' : undefined }),

  create: (data: Partial<ExpenseCategory>) => api.post<ExpenseCategory>('/expense-categories', data),

  update: (id: string, data: Partial<ExpenseCategory>) =>
    api.patch<ExpenseCategory>(`/expense-categories/${id}`, data),
}
