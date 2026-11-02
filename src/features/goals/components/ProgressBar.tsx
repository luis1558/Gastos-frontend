import { classNames } from '../../../utils/format'

interface ProgressBarProps {
  percent: number
  label: string
  className?: string
}

export function ProgressBar({ percent, label, className }: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, percent))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className={classNames('h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700', className)}
    >
      <div
        className={classNames(
          'h-full rounded-full transition-all duration-500',
          value >= 100 ? 'bg-green-500' : 'bg-indigo-500',
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
