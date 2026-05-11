import type { ReactNode } from 'react'
import { classNames } from '../../utils/format'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        padding && 'p-4 sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={classNames('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}
