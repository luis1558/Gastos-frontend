import { api } from '../../api/client'
import type { FixedPayment } from '../../types/models'

export interface FixedPaymentInput {
  name: string
  amount: number
  day_of_month: number
  category_id: string
  notes?: string | null
}

export interface FixedPaymentChanges extends Partial<FixedPaymentInput> {
  is_active?: boolean
}

export interface PayInput {
  year: number
  month: number
  amount?: number
  paid_on: string
}

export const fixedPaymentsApi = {
  list: (year: number, month: number) => api.get<FixedPayment[]>('/fixed-payments', { year, month }),

  create: (data: FixedPaymentInput) => api.post<FixedPayment>('/fixed-payments', data),

  update: (id: string, year: number, month: number, data: FixedPaymentChanges) =>
    api.patch<FixedPayment>(`/fixed-payments/${id}?year=${year}&month=${month}`, data),

  remove: (id: string) => api.delete<void>(`/fixed-payments/${id}`),

  pay: (id: string, data: PayInput) => api.post<FixedPayment>(`/fixed-payments/${id}/payments`, data),

  undoPayment: (id: string, year: number, month: number) =>
    api.delete<void>(`/fixed-payments/${id}/payments?year=${year}&month=${month}`),
}
