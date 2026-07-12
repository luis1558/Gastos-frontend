import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { reportsApi } from './api'
import { getCurrentYear } from '../../utils/format'

export function useYearlySummary(year?: number) {
  const y = year || getCurrentYear()
  return useQuery({
    queryKey: ['yearly-summary', y],
    queryFn: () => reportsApi.yearlySummary(y),
    placeholderData: keepPreviousData,
  })
}

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: ['monthly-summary', year, month],
    queryFn: () => reportsApi.monthlySummary(year, month),
    placeholderData: keepPreviousData,
  })
}

export function useMonthForecast(year: number, month: number) {
  return useQuery({
    queryKey: ['month-forecast', year, month],
    queryFn: () => reportsApi.monthForecast(year, month),
    placeholderData: keepPreviousData,
  })
}

export function useRecurringExpenses() {
  return useQuery({
    queryKey: ['recurring-expenses'],
    queryFn: () => reportsApi.recurringExpenses(),
    staleTime: 10 * 60 * 1000,
  })
}
