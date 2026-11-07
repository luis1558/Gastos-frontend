import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { del, get, set } from 'idb-keyval'

export const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000
const CACHE_KEY = 'gastos-query-cache'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      // Must be >= the persister maxAge, otherwise restored queries get garbage collected
      gcTime: CACHE_MAX_AGE,
      refetchOnWindowFocus: false,
    },
  },
})

export const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key) => get<string>(key).then((v) => v ?? null),
    setItem: (key, value) => set(key, value),
    removeItem: (key) => del(key),
  },
  key: CACHE_KEY,
  throttleTime: 1000,
})

/** Wipes in-memory and persisted data. Call on logout so the next user never sees it. */
export function clearPersistedCache(): void {
  queryClient.clear()
  void del(CACHE_KEY)
}
