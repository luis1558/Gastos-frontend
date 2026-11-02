import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cardsApi, type CardChanges, type CardPayInput } from './api'

export function useCards(year: number, month: number) {
  return useQuery({
    queryKey: ['cards', year, month],
    queryFn: () => cardsApi.list(year, month),
    placeholderData: keepPreviousData,
  })
}

export function useCardPurchases(id: string | undefined, year: number, month: number) {
  return useQuery({
    queryKey: ['card-purchases', id, year, month],
    queryFn: () => cardsApi.purchases(id!, year, month),
    enabled: !!id,
  })
}

// Paying (or undoing) may move an expense, which changes the balance, goals and monthly reports.
function useInvalidateAfterPayment() {
  const qc = useQueryClient()
  return () => {
    for (const key of ['cards', 'alerts', 'expenses', 'goal-overview', 'goals', 'monthly-summary', 'yearly-summary', 'month-forecast']) {
      qc.invalidateQueries({ queryKey: [key] })
    }
  }
}

export function useCreateCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cardsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards'] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Tarjeta creada')
    },
    onError: () => toast.error('No se pudo crear la tarjeta'),
  })
}

export function useUpdateCard(year: number, month: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CardChanges }) => cardsApi.update(id, year, month, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards'] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Tarjeta actualizada')
    },
    onError: () => toast.error('No se pudo actualizar la tarjeta'),
  })
}

export function useDeleteCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cardsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards'] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      qc.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Tarjeta eliminada')
    },
    onError: () => toast.error('No se pudo eliminar la tarjeta'),
  })
}

export function useSetStatement(year: number, month: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) => cardsApi.setStatement(id, year, month, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cards'] })
      qc.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Monto guardado')
    },
    onError: () => toast.error('No se pudo guardar el monto'),
  })
}

export function usePayCard() {
  const invalidate = useInvalidateAfterPayment()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & CardPayInput) => cardsApi.pay(id, data),
    onSuccess: () => {
      invalidate()
      toast.success('Pago de tarjeta registrado')
    },
    onError: () => toast.error('No se pudo registrar el pago. Puede que ya esté pagado este mes.'),
  })
}

export function useUndoCardPayment() {
  const invalidate = useInvalidateAfterPayment()
  return useMutation({
    mutationFn: ({ id, year, month }: { id: string; year: number; month: number }) =>
      cardsApi.undoPayment(id, year, month),
    onSuccess: () => {
      invalidate()
      toast.success('Pago deshecho')
    },
    onError: () => toast.error('No se pudo deshacer el pago'),
  })
}
