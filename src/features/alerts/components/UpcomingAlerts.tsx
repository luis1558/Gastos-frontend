import { useState } from 'react'
import { FiCheckCircle } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAlerts } from '../hooks'
import { ALERT_WINDOW_DAYS } from '../api'
import { AlertList } from './AlertList'
import { AlertsPanel } from './AlertsPanel'

const PREVIEW_COUNT = 4

/** Dashboard block with the closest due dates, so they are seen without opening the bell. */
export function UpcomingAlerts() {
  const [panelOpen, setPanelOpen] = useState(false)
  const { data } = useAlerts()
  if (!data) return null

  if (data.items.length === 0) {
    return (
      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <FiCheckCircle size={24} className="shrink-0 text-green-500" aria-hidden="true" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Todo al día</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tienes vencimientos en los próximos {ALERT_WINDOW_DAYS} días.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const preview = data.items.slice(0, PREVIEW_COUNT)
  const hidden = data.total - preview.length

  return (
    <Card className="mb-6">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Próximos vencimientos</h2>
        {data.overdue > 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
            {data.overdue} {data.overdue === 1 ? 'vencido' : 'vencidos'}
          </span>
        )}
      </div>
      <AlertList items={preview} />
      {hidden > 0 && (
        <Button variant="ghost" className="mt-1 w-full min-h-11" onClick={() => setPanelOpen(true)}>
          Ver los {data.total} avisos
        </Button>
      )}
      <AlertsPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </Card>
  )
}
