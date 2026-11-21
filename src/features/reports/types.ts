import type { MonthlySummary } from '../../types/models'

/** Backend Decimal values arrive as JSON strings; always convert with Number(). */
export type DecimalValue = number | string

/** monthly-summary also returns the base/extra income split (S10). */
export type MonthlySummaryWithIncome = MonthlySummary & {
  base_income: DecimalValue
  extra_income: DecimalValue
}

/** GET /reports/category-trend?year=YYYY (S13) */
export interface CategoryTrendItem {
  category_id: string | null
  category_name: string
  /** 12 amounts, January..December */
  monthly: DecimalValue[]
}

export interface CategoryTrendResponse {
  year: number
  categories: CategoryTrendItem[]
}

/** GET /reports/spending-breakdown?year=YYYY&month=M (S14) */
export interface PaymentMethodSpending {
  payment_method: string | null
  amount: DecimalValue
  count: number
}

export interface CardSpending {
  card_id: string
  card_name: string
  amount: DecimalValue
  count: number
}

export interface SpendingBreakdownResponse {
  by_payment_method: PaymentMethodSpending[]
  by_card: CardSpending[]
}
