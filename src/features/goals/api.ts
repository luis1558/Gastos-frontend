import { api } from '../../api/client'
import type { Goal, GoalContribution, GoalKind, GoalOverview } from '../../types/models'

export interface GoalInput {
  kind: GoalKind
  name: string
  target_amount: number
  target_date?: string | null
  notes?: string | null
  debt_id?: string | null
  fixed_payment_id?: string | null
  card_id?: string | null
}

export interface GoalChanges {
  name?: string
  target_amount?: number
  target_date?: string | null
  notes?: string | null
}

export interface ContributionInput {
  direction: 'deposit' | 'withdraw'
  amount: number
  contribution_date: string
  notes?: string
}

export const goalsApi = {
  overview: () => api.get<GoalOverview>('/goals/overview'),

  setOpeningBalance: (opening_balance: number) =>
    api.put<GoalOverview>('/goals/opening-balance', { opening_balance }),

  list: (status?: string) => api.get<Goal[]>('/goals', { status }),

  get: (id: string) => api.get<Goal>(`/goals/${id}`),

  create: (data: GoalInput) => api.post<Goal>('/goals', data),

  update: (id: string, data: GoalChanges) => api.patch<Goal>(`/goals/${id}`, data),

  complete: (id: string) => api.post<Goal>(`/goals/${id}/complete`),

  remove: (id: string) => api.delete<void>(`/goals/${id}`),

  contributions: (id: string) => api.get<GoalContribution[]>(`/goals/${id}/contributions`),

  contribute: (id: string, data: ContributionInput) =>
    api.post<GoalContribution>(`/goals/${id}/contributions`, data),
}
