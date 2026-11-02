import type { Debt, InterestType, RatePeriod } from '../../types/models'
import { INTEREST_TYPES, RATE_TYPES } from '../../utils/constants'

const DAYS_PER_YEAR = 365
const MONTHS_PER_YEAR = 12

interface EstimateInput {
  amount: number
  interestType: InterestType
  /** Percent per `period`, e.g. 12.5 for 12.5%. */
  rate: number
  period: RatePeriod
  days: number
}

/**
 * Rough projection shown while filling the form (no payments, constant rate).
 * Mirrors the backend formulas so the preview matches what the server computes.
 */
export function estimateInterest({ amount, interestType, rate, period, days }: EstimateInput): number {
  if (interestType === 'none' || !(amount > 0) || !(rate > 0) || !(days > 0)) return 0
  const perMonth = period === 'monthly' ? rate / 100 : rate / 100 / MONTHS_PER_YEAR
  if (interestType === 'simple') {
    return (amount * perMonth * MONTHS_PER_YEAR * days) / DAYS_PER_YEAR
  }
  return amount * ((1 + perMonth) ** ((days * MONTHS_PER_YEAR) / DAYS_PER_YEAR) - 1)
}

export function formatRate(rate: number | string, period: RatePeriod): string {
  return `${Number(rate)}% ${period === 'annual' ? 'anual' : 'mensual'}`
}

export function interestTypeLabel(type: InterestType): string {
  return INTEREST_TYPES.find((t) => t.value === type)?.label ?? type
}

export function rateTypeLabel(type: Debt['rate_type']): string {
  return RATE_TYPES.find((t) => t.value === type)?.label ?? type
}
