import type { AlertItem } from '../../../types/models'

export function describeDue(item: AlertItem): string {
  const days = item.days_left
  if (days < 0) return `Venció hace ${-days} ${-days === 1 ? 'día' : 'días'}`
  if (days === 0) return 'Vence hoy'
  if (days === 1) return 'Vence mañana'
  return `Vence en ${days} días`
}

export const dueToneClass: Record<AlertItem['severity'], string> = {
  overdue: 'text-red-600 dark:text-red-400',
  today: 'text-amber-600 dark:text-amber-400',
  soon: 'text-gray-500 dark:text-gray-400',
}
