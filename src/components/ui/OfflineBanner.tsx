import { useIsRestoring, useMutationState } from '@tanstack/react-query'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const isRestoring = useIsRestoring()
  const pending = useMutationState({ filters: { status: 'pending' } }).length

  if (isRestoring || (isOnline && pending === 0)) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 bg-amber-500 px-4 py-1.5 text-center text-sm font-medium text-amber-950"
    >
      {isOnline
        ? `Sincronizando ${pending} cambio${pending === 1 ? '' : 's'}...`
        : pending > 0
          ? `Sin conexión. ${pending} cambio${pending === 1 ? '' : 's'} pendiente${pending === 1 ? '' : 's'} (no cierres la app)`
          : 'Sin conexión. Mostrando datos guardados.'}
    </div>
  )
}
