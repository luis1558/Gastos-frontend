import { FiAlertTriangle } from 'react-icons/fi'
import { Loading } from '../../../components/ui/Loading'

export function BlockLoading() {
  return <Loading />
}

export function BlockEmpty({ message }: { message: string }) {
  return (
    <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-8">{message}</p>
  )
}

export function BlockError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <FiAlertTriangle className="text-red-500" size={24} />
      <p className="text-sm text-red-600 dark:text-red-400">
        {message ?? 'No se pudo cargar esta información.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
