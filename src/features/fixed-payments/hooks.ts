import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fixedPaymentsApi, type FixedPaymentChanges } from './api'

export function useFixedPayments(year: number, month: number) {
  return useQuery({
    queryKey: ['fixed-payments', year, month],
    queryFn: () => fixedPaymentsApi.list(year, month),
    placeholderData: keepPreviousData,
  })
}

// Paying (or undoing) moves an expense, which changes the balance, goals and monthly reports.
function useInvalidateAfterPayment() {
  const qc = useQueryClient()
  return () => {
    for (const key of ['fixed-payments', 'expenses', 'goal-overview', 'goals', 'monthly-summary', 'yearly-summary', 'month-forecast']) {
      qc.invalidateQueries({ queryKey: [key] })
    }
  }
}

export function useCreateFixedPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fixedPaymentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed-payments'] })
      toast.success('Pago fijo creado')
    },
    onError: () => toast.error('No se pudo crear el pago fijo'),
  })
}

export function useUpdateFixedPayment(year: number, month: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FixedPaymentChanges }) =>
      fixedPaymentsApi.update(id, year, month, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed-payments'] })
      toast.success('Pago fijo actualizado')
    },
    onError: () => toast.error('No se pudo actualizar el pago fijo'),
  })
}

export function useDeleteFixedPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fixedPaymentsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed-payments'] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Pago fijo eliminado')
    },
    onError: () => toast.error('No se pudo eliminar el pago fijo'),
  })
}

export function usePayFixedPayment() {
  const invalidate = useInvalidateAfterPayment()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof fixedPaymentsApi.pay>[1]) =>
      fixedPaymentsApi.pay(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Pago registrado como gasto')
    },
    onError: () => toast.error('No se pudo registrar el pago. Puede que ya esté pagado este mes.'),
  })
}

export function useUndoFixedPayment() {
  const invalidate = useInvalidateAfterPayment()
  return useMutation({
    mutationFn: ({ id, year, month }: { id: string; year: number; month: number }) =>
      fixedPaymentsApi.undoPayment(id, year, month),
    onSuccess: () => {
      invalidate()
      toast.success('Pago deshecho y gasto eliminado')
    },
    onError: () => toast.error('No se pudo deshacer el pago'),
  })
}
