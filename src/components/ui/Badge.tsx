import { classNames } from '../../utils/format'

interface BadgeProps {
  children: string
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'indigo'
}

const colors = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  return (
    <span className={classNames('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color])}>
      {children}
    </span>
  )
}
