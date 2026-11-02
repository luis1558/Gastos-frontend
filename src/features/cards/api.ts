import { api } from '../../api/client'
import type { Card } from '../../types/models'

export interface CardInput {
  name: string
  last_four?: string | null
  payment_day: number
  tracks_purchases: boolean
  category_id?: string | null
  notes?: string | null
}

export interface CardChanges extends Partial<CardInput> {
  is_active?: boolean
}

export interface CardPayInput {
  year: number
  month: number
  amount?: number
  paid_on: string
}

export const cardsApi = {
  list: (year: number, month: number) => api.get<Card[]>('/cards', { year, month }),

  create: (data: CardInput) => api.post<Card>('/cards', data),

  update: (id: string, year: number, month: number, data: CardChanges) =>
    api.patch<Card>(`/cards/${id}?year=${year}&month=${month}`, data),

  remove: (id: string) => api.delete<void>(`/cards/${id}`),

  setStatement: (id: string, year: number, month: number, amount: number) =>
    api.put<Card>(`/cards/${id}/statement?year=${year}&month=${month}`, { amount }),

  pay: (id: string, data: CardPayInput) => api.post<Card>(`/cards/${id}/payments`, data),

  undoPayment: (id: string, year: number, month: number) =>
    api.delete<Card>(`/cards/${id}/payments?year=${year}&month=${month}`),
}
