import type { ReactNode } from 'react'
import { FiInbox } from 'react-icons/fi'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 mb-4">
        {icon || <FiInbox size={48} />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
