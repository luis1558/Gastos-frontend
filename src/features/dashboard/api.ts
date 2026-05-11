import { api } from '../../api/client'
import type { MonthlySummary } from '../../types/models'

export const dashboardApi = {
  monthlySummary: (year: number, month: number) =>
    api.get<MonthlySummary>('/reports/monthly-summary', { year, month }),
}
