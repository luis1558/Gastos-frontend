import { useQuery } from '@tanstack/react-query'
import { reportsApi } from './api'
import { getCurrentYear } from '../../utils/format'

export function useYearlySummary(year?: number) {
  const y = year || getCurrentYear()
  return useQuery({
    queryKey: ['yearly-summary', y],
    queryFn: () => reportsApi.yearlySummary(y),
  })
}
