import { FiFileText, FiLayers, FiRepeat, FiTarget } from 'react-icons/fi'
import type { AlertItem } from '../../../types/models'
import { classNames } from '../../../utils/format'

const kinds = {
  debt: { icon: FiFileText, style: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  fixed_payment: { icon: FiRepeat, style: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  card: { icon: FiLayers, style: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  goal: { icon: FiTarget, style: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
} as const

export function AlertIcon({ kind }: { kind: AlertItem['kind'] }) {
  const { icon: Icon, style } = kinds[kind]
  return (
    <span className={classNames('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', style)}>
      <Icon size={20} aria-hidden="true" />
    </span>
  )
}
