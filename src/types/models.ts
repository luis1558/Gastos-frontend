export interface User {
  id: string
  email: string
  full_name?: string | null
  is_active: boolean
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export interface MonthlyIncomeConfig {
  id: string
  user_id: string
  year: number
  month: number
  base_income: number
  extra_income: number
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  user_id: string
  name: string
  slug: string
  color?: string | null
  icon?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string
  category_name?: string
  category_slug?: string
  expense_date: string
  year: number
  month: number
  period_year?: number
  period_month?: number
  amount: number
  description: string
  payment_method?: PaymentMethod | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Counterparty {
  id: string
  user_id: string
  name: string
  type?: CounterpartyType | null
  phone?: string | null
  email?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  user_id: string
  counterparty_id: string
  counterparty_name?: string
  type: DebtType
  status: DebtStatus
  origin_date: string
  due_date?: string | null
  original_amount: number
  paid_amount?: number
  /** Total still owed today: principal remaining plus accrued interest. */
  remaining_amount?: number
  principal_remaining?: number
  accrued_interest?: number
  total_interest?: number
  interest_type: InterestType
  rate_type: RateType
  rate_period: RatePeriod
  /** Rate the debt started with, in percent per `rate_period`. */
  interest_rate: number
  /** Rate in effect today (differs from `interest_rate` on variable debts). */
  current_rate?: number
  projected_total_at_due?: number | null
  description: string
  notes?: string | null
  closed_at?: string | null
  created_at: string
  updated_at: string
  payments?: DebtPayment[]
}

export interface DebtPayment {
  id: string
  user_id: string
  debt_id: string
  payment_date: string
  amount: number
  description?: string | null
  notes?: string | null
  category_id?: string | null
  expense_id?: string | null
  created_at: string
  updated_at: string
}

export interface DebtRateChange {
  id: string
  debt_id: string
  effective_date: string
  rate: number
  notes?: string | null
  created_at: string
}

export type PaymentMethod = 'cash' | 'debit_card' | 'credit_card' | 'transfer' | 'digital_wallet' | 'other'
export type DebtType = 'receivable' | 'payable'
export type InterestType = 'none' | 'simple' | 'compound'
export type RateType = 'fixed' | 'variable'
export type RatePeriod = 'monthly' | 'annual'
export type DebtStatus = 'pending' | 'partially_paid' | 'paid' | 'cancelled'
export type CounterpartyType = 'person' | 'bank' | 'business' | 'family' | 'friend' | 'other'

export interface CategorySummary {
  category_id: string
  category_name: string
  category_slug: string
  total_amount: number
  transaction_count: number
  percentage?: number
}

export interface MonthlySummary {
  year: number
  month: number
  total_income: number
  total_expenses: number
  balance: number
  top_categories: CategorySummary[]
}

export interface YearMonthItem {
  year: number
  month: number
  total_income: number
  total_expenses: number
  balance: number
  transaction_count: number
}

export interface YearlySummary {
  year: number
  total_income: number
  total_expenses: number
  balance: number
  months: YearMonthItem[]
}

export interface MonthForecast {
  year: number
  month: number
  days_in_month: number
  days_elapsed: number
  total_spent: number
  daily_rate: number
  projected_expenses: number
  total_income: number
  projected_balance: number
  pace_pct: number | null
}

export interface DebtSummary {
  total_receivable_pending: number
  total_payable_pending: number
  overdue_receivable_count: number
  overdue_payable_count: number
  active_debt_count: number
}

export interface RecurringExpenseItem {
  description: string
  category_id: string
  category_name: string
  category_slug: string
  avg_amount: number
  occurrence_months: number
  last_amount: number
  last_date: string
}

export interface RecurringExpenses {
  checked_months: number
  items: RecurringExpenseItem[]
}

export type GoalKind = 'debt' | 'card' | 'fixed_payment' | 'personal'
export type GoalStatus = 'active' | 'completed'

export interface Goal {
  id: string
  kind: GoalKind
  status: GoalStatus
  name: string
  target_amount: number
  target_date?: string | null
  notes?: string | null
  debt_id?: string | null
  debt_label?: string | null
  saved_amount: number
  remaining_amount: number
  progress_percent: number
  created_at: string
  closed_at?: string | null
}

export interface GoalContribution {
  id: string
  goal_id: string
  contribution_date: string
  /** Positive when money was set aside, negative when it was taken back. */
  amount: number
  notes?: string | null
  created_at: string
}

export interface GoalOverview {
  opening_balance: number
  total_income: number
  total_expenses: number
  balance: number
  reserved: number
  /** balance - reserved: what can still be spent. */
  available: number
}
