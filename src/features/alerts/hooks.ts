import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { todayLocalDate } from '../../utils/format'
import { alertsApi } from './api'

export function useAlerts() {
  const today = todayLocalDate()
  return useQuery({
    queryKey: ['alerts', today],
    queryFn: () => alertsApi.list(today),
    placeholderData: keepPreviousData,
    // Due dates also move with the clock, so look again from time to time.
    refetchInterval: 5 * 60 * 1000,
  })
}
