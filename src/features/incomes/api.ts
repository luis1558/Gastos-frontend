import { api } from '../../api/client'
import type { MonthlyIncomeConfig } from '../../types/models'

export const incomesApi = {
  list: (year: number) =>
    api.get<MonthlyIncomeConfig[]>('/monthly-incomes', { year }),

  get: (year: number, month: number) =>
    api.get<MonthlyIncomeConfig>(`/monthly-incomes/${year}/${month}`),

  upsert: (year: number, month: number, data: Partial<MonthlyIncomeConfig>) =>
    api.put<MonthlyIncomeConfig>(`/monthly-incomes/${year}/${month}`, data),
}
