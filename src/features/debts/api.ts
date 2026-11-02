import { api } from '../../api/client'
import type { Debt, DebtPayment, DebtRateChange, Counterparty, DebtSummary } from '../../types/models'

export const debtsApi = {
  list: (type?: string, status?: string) =>
    api.get<Debt[]>('/debts', { type, status }),

  get: (id: string) => api.get<Debt>(`/debts/${id}`),

  create: (data: Partial<Debt>) => api.post<Debt>('/debts', data),

  update: (id: string, data: Partial<Debt>) => api.patch<Debt>(`/debts/${id}`, data),

  summary: () => api.get<DebtSummary>('/debts/summary'),

  payments: (debtId: string) => api.get<DebtPayment[]>(`/debts/${debtId}/payments`),

  createPayment: (debtId: string, data: Partial<DebtPayment>) =>
    api.post<DebtPayment>(`/debts/${debtId}/payments`, data),

  rateChanges: (debtId: string) => api.get<DebtRateChange[]>(`/debts/${debtId}/rate-changes`),

  createRateChange: (debtId: string, data: Pick<DebtRateChange, 'effective_date' | 'rate'>) =>
    api.post<DebtRateChange>(`/debts/${debtId}/rate-changes`, data),

  deleteRateChange: (debtId: string, rateChangeId: string) =>
    api.delete<void>(`/debts/${debtId}/rate-changes/${rateChangeId}`),
}

export const counterpartiesApi = {
  list: () => api.get<Counterparty[]>('/counterparties'),

  create: (data: Partial<Counterparty>) => api.post<Counterparty>('/counterparties', data),
}
