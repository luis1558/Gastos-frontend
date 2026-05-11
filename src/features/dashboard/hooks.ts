import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from './api'
import { getCurrentYear, getCurrentMonth } from '../../utils/format'

export function useMonthlySummary(year?: number, month?: number) {
  const y = year || getCurrentYear()
  const m = month || getCurrentMonth()

  return useQuery({
    queryKey: ['monthly-summary', y, m],
    queryFn: () => dashboardApi.monthlySummary(y, m),
  })
}
