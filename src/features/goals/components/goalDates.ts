import { daysUntil, formatDate } from '../../../utils/format'

export interface DateHint {
  text: string
  tone: 'neutral' | 'soon' | 'late'
}

/** Short, human description of a goal's optional target date. */
export function describeTargetDate(targetDate?: string | null): DateHint {
  if (!targetDate) return { text: 'Sin fecha', tone: 'neutral' }
  const days = daysUntil(targetDate)
  const when = formatDate(targetDate)
  if (days < 0) return { text: `${when} · venció hace ${-days} ${-days === 1 ? 'día' : 'días'}`, tone: 'late' }
  if (days === 0) return { text: `${when} · es hoy`, tone: 'soon' }
  if (days === 1) return { text: `${when} · es mañana`, tone: 'soon' }
  return { text: `${when} · faltan ${days} días`, tone: days <= 7 ? 'soon' : 'neutral' }
}

export const dateToneClass: Record<DateHint['tone'], string> = {
  neutral: 'text-gray-500 dark:text-gray-400',
  soon: 'text-amber-600 dark:text-amber-400',
  late: 'text-red-600 dark:text-red-400',
}
