const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatDate(date: string): string {
  // Date-only strings ("YYYY-MM-DD") are parsed as UTC by `new Date`, which shifts
  // the day back in timezones behind UTC. Build them as local dates instead.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(date)
  return parsed.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Today as YYYY-MM-DD in the user's timezone (toISOString would use UTC and can show tomorrow). */
export function todayLocalDate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** Calendar days from today until a YYYY-MM-DD date; negative when it already passed. */
export function daysUntil(date: string): number {
  const today = parseLocalDate(todayLocalDate())
  return Math.round((parseLocalDate(date).getTime() - today.getTime()) / 86_400_000)
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1)
  return date.toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getYearOptions(): number[] {
  const current = getCurrentYear()
  return Array.from({ length: 5 }, (_, i) => current - 2 + i)
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
