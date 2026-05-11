import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '../utils/constants'
import { LoadingPage } from '../components/ui/Loading'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <LoadingPage />
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <LoadingPage />
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />

  return <Outlet />
}
