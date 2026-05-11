import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { incomesApi } from './api'
import { getCurrentYear, getCurrentMonth } from '../../utils/format'

export function useIncomesList(year?: number) {
  const y = year || getCurrentYear()
  return useQuery({
    queryKey: ['monthly-incomes', y],
    queryFn: () => incomesApi.list(y),
  })
}

export function useIncome(year?: number, month?: number) {
  const y = year || getCurrentYear()
  const m = month || getCurrentMonth()

  return useQuery({
    queryKey: ['monthly-income', y, m],
    queryFn: () => incomesApi.get(y, m),
    retry: false,
  })
}

export function useUpsertIncome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ year, month, data }: {
      year: number
      month: number
      data: Partial<import('../../types/models').MonthlyIncomeConfig>
    }) => incomesApi.upsert(year, month, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monthly-income'] }),
  })
}
