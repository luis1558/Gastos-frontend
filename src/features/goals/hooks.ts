import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { goalsApi, type GoalChanges, type ContributionInput } from './api'

export function useGoalOverview() {
  return useQuery({
    queryKey: ['goal-overview'],
    queryFn: goalsApi.overview,
    placeholderData: keepPreviousData,
  })
}

export function useGoals(status?: string) {
  return useQuery({
    queryKey: ['goals', status],
    queryFn: () => goalsApi.list(status),
    placeholderData: keepPreviousData,
  })
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalsApi.get(id),
    enabled: !!id,
  })
}

export function useContributions(id: string) {
  return useQuery({
    queryKey: ['goal-contributions', id],
    queryFn: () => goalsApi.contributions(id),
    enabled: !!id,
  })
}

// Any goal change can alter the reserved total, so everything related is refreshed.
function useInvalidateGoals() {
  const qc = useQueryClient()
  return (goalId?: string) => {
    qc.invalidateQueries({ queryKey: ['goals'] })
    qc.invalidateQueries({ queryKey: ['goal-overview'] })
    qc.invalidateQueries({ queryKey: ['alerts'] })
    if (goalId) {
      qc.invalidateQueries({ queryKey: ['goal', goalId] })
      qc.invalidateQueries({ queryKey: ['goal-contributions', goalId] })
    }
  }
}

export function useCreateGoal() {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      invalidate()
      toast.success('Meta creada')
    },
    onError: () => toast.error('No se pudo crear la meta'),
  })
}

export function useUpdateGoal(id: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (data: GoalChanges) => goalsApi.update(id, data),
    onSuccess: () => {
      invalidate(id)
      toast.success('Meta actualizada')
    },
    onError: () => toast.error('No se pudo actualizar la meta'),
  })
}

export function useCompleteGoal(id: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: () => goalsApi.complete(id),
    onSuccess: () => {
      invalidate(id)
      toast.success('Meta cumplida. El dinero vuelve a estar disponible')
    },
    onError: () => toast.error('No se pudo marcar la meta como cumplida'),
  })
}

export function useDeleteGoal(id: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: () => goalsApi.remove(id),
    onSuccess: () => {
      invalidate()
      toast.success('Meta eliminada')
    },
    onError: () => toast.error('No se pudo eliminar la meta'),
  })
}

export function useContribute(id: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (data: ContributionInput) => goalsApi.contribute(id, data),
    onSuccess: (_result, variables) => {
      invalidate(id)
      toast.success(variables.direction === 'deposit' ? 'Dinero apartado' : 'Dinero devuelto a tu disponible')
    },
    onError: () => toast.error('No se pudo registrar el movimiento. Revisa los montos.'),
  })
}

export function useSetOpeningBalance() {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: goalsApi.setOpeningBalance,
    onSuccess: () => {
      invalidate()
      toast.success('Saldo inicial actualizado')
    },
    onError: () => toast.error('No se pudo guardar el saldo inicial'),
  })
}
