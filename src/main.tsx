import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { registerSW } from 'virtual:pwa-register'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { queryClient, persister, CACHE_MAX_AGE } from './lib/queryClient'
import { OfflineBanner } from './components/ui/OfflineBanner'

useAuthStore.getState().initialize()
useThemeStore.getState().initialize()

// After a new Vercel deploy, lazy-loaded chunks get new hashes.
// Users with the old app loaded would get "Failed to fetch dynamically imported module".
// Vite fires this event on preload failure — reloading fetches the fresh chunks.
window.addEventListener('vite:preloadError', () => window.location.reload())

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <PersistQueryClientProvider
    client={queryClient}
    persistOptions={{
      persister,
      maxAge: CACHE_MAX_AGE,
      // Bump when the shape of cached API data changes to discard old caches
      buster: 'v1',
      // Writes are only queued in memory: mutationFns can't be serialized, so
      // restoring paused mutations after a reload would fail.
      dehydrateOptions: { shouldDehydrateMutation: () => false },
    }}
  >
    <StrictMode>
      <OfflineBanner />
      <App />
      <Toaster position="bottom-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </StrictMode>
  </PersistQueryClientProvider>,
)
