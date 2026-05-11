import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { debtsApi, counterpartiesApi } from './api'

export function useDebts(type?: string, status?: string) {
  return useQuery({
    queryKey: ['debts', type, status],
    queryFn: () => debtsApi.list(type, status),
  })
}

export function useDebt(id: string) {
  return useQuery({
    queryKey: ['debt', id],
    queryFn: () => debtsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: debtsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  })
}

export function useUpdateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../../types/models').Debt> }) =>
      debtsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['debt'] })
    },
  })
}

export function useDebtSummary() {
  return useQuery({
    queryKey: ['debt-summary'],
    queryFn: debtsApi.summary,
  })
}

export function usePayments(debtId: string) {
  return useQuery({
    queryKey: ['payments', debtId],
    queryFn: () => debtsApi.payments(debtId),
    enabled: !!debtId,
  })
}

export function useCreatePayment(debtId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<import('../../types/models').DebtPayment>) =>
      debtsApi.createPayment(debtId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', debtId] })
      qc.invalidateQueries({ queryKey: ['debt', debtId] })
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['debt-summary'] })
    },
  })
}

export function useCounterparties() {
  return useQuery({
    queryKey: ['counterparties'],
    queryFn: counterpartiesApi.list,
  })
}

export function useCreateCounterparty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: counterpartiesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['counterparties'] }),
  })
}
