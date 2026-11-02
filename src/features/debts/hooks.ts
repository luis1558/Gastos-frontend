import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { debtsApi, counterpartiesApi } from './api'

export function useDebts(type?: string, status?: string) {
  return useQuery({
    queryKey: ['debts', type, status],
    queryFn: () => debtsApi.list(type, status),
    placeholderData: keepPreviousData,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['debt-summary'] })
      toast.success('Deuda registrada')
    },
    onError: () => toast.error('No se pudo registrar la deuda'),
  })
}

export function useUpdateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<import('../../types/models').Debt> }) =>
      debtsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['debt'] })
    },
  })
}

export function useDebtSummary() {
  return useQuery({
    queryKey: ['debt-summary'],
    queryFn: debtsApi.summary,
    placeholderData: keepPreviousData,
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
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['debt-summary'] })
      toast.success('Pago registrado')
    },
    onError: () => toast.error('No se pudo registrar el pago. Revisa que el monto no supere el saldo.'),
  })
}

export function useRateChanges(debtId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['rate-changes', debtId],
    queryFn: () => debtsApi.rateChanges(debtId),
    enabled: !!debtId && enabled,
  })
}

function useInvalidateDebt(debtId: string) {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['rate-changes', debtId] })
    qc.invalidateQueries({ queryKey: ['debt', debtId] })
    qc.invalidateQueries({ queryKey: ['debts'] })
    qc.invalidateQueries({ queryKey: ['debt-summary'] })
  }
}

export function useCreateRateChange(debtId: string) {
  const invalidate = useInvalidateDebt(debtId)
  return useMutation({
    mutationFn: (data: Pick<import('../../types/models').DebtRateChange, 'effective_date' | 'rate'>) =>
      debtsApi.createRateChange(debtId, data),
    onSuccess: () => {
      invalidate()
      toast.success('Cambio de tasa registrado')
    },
    onError: () => toast.error('No se pudo registrar el cambio. Revisa que no exista otro en esa fecha.'),
  })
}

export function useDeleteRateChange(debtId: string) {
  const invalidate = useInvalidateDebt(debtId)
  return useMutation({
    mutationFn: (rateChangeId: string) => debtsApi.deleteRateChange(debtId, rateChangeId),
    onSuccess: () => {
      invalidate()
      toast.success('Cambio de tasa eliminado')
    },
    onError: () => toast.error('No se pudo eliminar el cambio de tasa'),
  })
}

export function useCounterparties() {
  return useQuery({
    queryKey: ['counterparties'],
    queryFn: counterpartiesApi.list,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useCreateCounterparty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: counterpartiesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['counterparties'] }),
  })
}
