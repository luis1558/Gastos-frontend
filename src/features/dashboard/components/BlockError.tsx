import { FiAlertTriangle } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'

interface BlockErrorProps {
  title: string
  onRetry?: () => void
  className?: string
}

/** Shown in place of a dashboard block when its request fails, so the block never silently disappears. */
export function BlockError({ title, onRetry, className }: BlockErrorProps) {
  return (
    <Card className={className}>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <FiAlertTriangle className="shrink-0" />
        <span>No se pudo cargar esta información.</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-auto text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Reintentar
          </button>
        )}
      </div>
    </Card>
  )
}
