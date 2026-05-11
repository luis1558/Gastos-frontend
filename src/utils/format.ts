const currencyFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
