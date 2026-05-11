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
  remaining_amount?: number
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
  created_at: string
  updated_at: string
}

export type PaymentMethod = 'cash' | 'debit_card' | 'credit_card' | 'transfer' | 'digital_wallet' | 'other'
export type DebtType = 'receivable' | 'payable'
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

export interface DebtSummary {
  total_receivable_pending: number
  total_payable_pending: number
  overdue_receivable_count: number
  overdue_payable_count: number
  active_debt_count: number
}
