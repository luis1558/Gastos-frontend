import { classNames } from '../../utils/format'

interface BadgeProps {
  children: string
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'indigo'
}

const colors = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-700',
  indigo: 'bg-indigo-100 text-indigo-700',
}

export function Badge({ children, color = 'gray' }: BadgeProps) {
  return (
    <span className={classNames('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color])}>
      {children}
    </span>
  )
}
