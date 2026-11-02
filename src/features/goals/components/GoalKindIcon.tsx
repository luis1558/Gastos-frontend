import { FiFileText, FiCreditCard, FiRepeat, FiStar } from 'react-icons/fi'
import type { GoalKind } from '../../../types/models'
import { classNames } from '../../../utils/format'

const kinds = {
  debt: { icon: FiFileText, style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  card: { icon: FiCreditCard, style: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  fixed_payment: { icon: FiRepeat, style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  personal: { icon: FiStar, style: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
} as const

export function GoalKindIcon({ kind, size = 'md' }: { kind: GoalKind; size?: 'md' | 'lg' }) {
  const { icon: Icon, style } = kinds[kind]
  return (
    <span
      className={classNames(
        'inline-flex shrink-0 items-center justify-center rounded-xl',
        size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
        style,
      )}
    >
      <Icon size={size === 'lg' ? 24 : 20} aria-hidden="true" />
    </span>
  )
}
