import { FiCheckCircle } from 'react-icons/fi'
import { Modal } from '../../../components/ui/Modal'
import { Loading } from '../../../components/ui/Loading'
import { useAlerts } from '../hooks'
import { ALERT_WINDOW_DAYS } from '../api'
import { AlertList } from './AlertList'

interface AlertsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AlertsPanel({ isOpen, onClose }: AlertsPanelProps) {
  const { data, isLoading } = useAlerts()
  if (!isOpen) return null

  return (
    <Modal isOpen onClose={onClose} title="Avisos" size="lg">
      {isLoading ? (
        <Loading />
      ) : data && data.items.length > 0 ? (
        <>
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            Vencidos y los que vencen en los próximos {ALERT_WINDOW_DAYS} días.
          </p>
          <AlertList items={data.items} onNavigate={onClose} />
        </>
      ) : (
        <div className="flex flex-col items-center py-8 text-center">
          <FiCheckCircle size={40} className="mb-3 text-green-500" aria-hidden="true" />
          <p className="font-medium text-gray-900 dark:text-gray-100">Todo al día</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No tienes vencimientos en los próximos {ALERT_WINDOW_DAYS} días.
          </p>
        </div>
      )}
    </Modal>
  )
}
