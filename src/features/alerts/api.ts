import { api } from '../../api/client'
import type { AlertsResponse } from '../../types/models'

/** How many days ahead a due date starts to be reported. */
export const ALERT_WINDOW_DAYS = 7

export const alertsApi = {
  // The local date is sent so "today" follows the user's timezone and not the server's.
  list: (today: string, days: number = ALERT_WINDOW_DAYS) => api.get<AlertsResponse>('/alerts', { today, days }),
}
