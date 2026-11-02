function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function clampedDay(year: number, month: number, day: number): number {
  // Day 0 of the next month is the last day of this one.
  return Math.min(day, new Date(year, month, 0).getDate())
}

/**
 * Next date (local time) on which a payment due on `dayOfMonth` falls.
 * Pass `skipThisMonth` when this month's payment is already settled.
 */
export function nextDueDate(dayOfMonth: number, skipThisMonth = false): string {
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth() + 1
  const thisMonth = toIso(year, month, clampedDay(year, month, dayOfMonth))
  const today = toIso(year, month, now.getDate())
  if (!skipThisMonth && thisMonth >= today) return thisMonth
  month += 1
  if (month > 12) {
    month = 1
    year += 1
  }
  return toIso(year, month, clampedDay(year, month, dayOfMonth))
}
