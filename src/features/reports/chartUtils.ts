import { PAYMENT_METHODS } from '../../utils/constants'

export const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6']

export const TOOLTIP_STYLE = { borderRadius: '8px', border: '1px solid #e2e8f0' }

export function formatAxisCurrency(v: number): string {
  return `$${(v / 1000).toFixed(0)}k`
}

export function paymentMethodLabel(value: string | null): string {
  if (!value) return 'Sin método'
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value
}

/** Yearly savings rate weighted by income: yearly balance ÷ yearly income (S5). */
export function yearlySavingsRate(balance: number | string, income: number | string): number | null {
  const totalIncome = Number(income)
  if (!(totalIncome > 0)) return null
  return Math.round((Number(balance) / totalIncome) * 100)
}
