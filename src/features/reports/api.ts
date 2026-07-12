import { api } from '../../api/client'
import type { MonthlySummary, YearlySummary, MonthForecast, RecurringExpenses } from '../../types/models'

export const reportsApi = {
  monthlySummary: (year: number, month: number) =>
    api.get<MonthlySummary>('/reports/monthly-summary', { year, month }),

  yearlySummary: (year: number) =>
    api.get<YearlySummary>('/reports/yearly-summary', { year }),

  monthForecast: (year: number, month: number) =>
    api.get<MonthForecast>('/reports/month-forecast', { year, month }),

  recurringExpenses: () =>
    api.get<RecurringExpenses>('/reports/recurring-expenses'),
}
