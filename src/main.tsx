import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuthStore } from './stores/authStore'

const queryClient = new QueryClient()

useAuthStore.getState().initialize()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </StrictMode>
  </QueryClientProvider>,
)
