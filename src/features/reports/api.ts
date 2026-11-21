import { api } from '../../api/client'
import type { YearlySummary, MonthForecast, RecurringExpenses } from '../../types/models'
import type {
  CategoryTrendResponse,
  MonthlySummaryWithIncome,
  SpendingBreakdownResponse,
} from './types'

export const reportsApi = {
  monthlySummary: (year: number, month: number) =>
    api.get<MonthlySummaryWithIncome>('/reports/monthly-summary', { year, month }),

  yearlySummary: (year: number) =>
    api.get<YearlySummary>('/reports/yearly-summary', { year }),

  monthForecast: (year: number, month: number) =>
    api.get<MonthForecast>('/reports/month-forecast', { year, month }),

  recurringExpenses: () =>
    api.get<RecurringExpenses>('/reports/recurring-expenses'),

  categoryTrend: (year: number) =>
    api.get<CategoryTrendResponse>('/reports/category-trend', { year }),

  spendingBreakdown: (year: number, month: number) =>
    api.get<SpendingBreakdownResponse>('/reports/spending-breakdown', { year, month }),
}
