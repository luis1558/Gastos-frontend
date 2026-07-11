import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { ROUTES } from '../utils/constants'
import { LoadingPage } from '../components/ui/Loading'

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ExpensesPage = lazy(() => import('../features/expenses/pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })))
const CategoriesPage = lazy(() => import('../features/expenses/pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })))
const IncomesPage = lazy(() => import('../features/incomes/pages/IncomesPage').then(m => ({ default: m.IncomesPage })))
const DebtsListPage = lazy(() => import('../features/debts/pages/DebtsListPage').then(m => ({ default: m.DebtsListPage })))
const DebtDetailPage = lazy(() => import('../features/debts/pages/DebtDetailPage').then(m => ({ default: m.DebtDetailPage })))
const CounterpartiesPage = lazy(() => import('../features/debts/pages/CounterpartiesPage').then(m => ({ default: m.CounterpartiesPage })))
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingPage />}>{children}</Suspense>
}

function RootErrorBoundary() {
  const error = useRouteError() as Error
  const isChunkError = error?.message?.includes('dynamically imported module')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="text-center max-w-sm">
        {isChunkError ? (
          <>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Nueva versión disponible</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">La app se actualizó. Recargá para continuar.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Recargar
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Algo salió mal</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error?.message ?? 'Error inesperado'}</p>
            <button
              onClick={() => window.location.assign('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    errorElement: <RootErrorBoundary />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          { path: ROUTES.LOGIN, element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
          { path: ROUTES.REGISTER, element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.DASHBOARD, element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper> },
              { path: ROUTES.EXPENSES, element: <SuspenseWrapper><ExpensesPage /></SuspenseWrapper> },
              { path: ROUTES.EXPENSES_CATEGORIES, element: <SuspenseWrapper><CategoriesPage /></SuspenseWrapper> },
              { path: ROUTES.INCOMES, element: <SuspenseWrapper><IncomesPage /></SuspenseWrapper> },
              { path: ROUTES.DEBTS, element: <SuspenseWrapper><DebtsListPage /></SuspenseWrapper> },
              { path: ROUTES.DEBT_DETAIL(':id'), element: <SuspenseWrapper><DebtDetailPage /></SuspenseWrapper> },
              { path: ROUTES.COUNTERPARTIES, element: <SuspenseWrapper><CounterpartiesPage /></SuspenseWrapper> },
              { path: ROUTES.REPORTS, element: <SuspenseWrapper><ReportsPage /></SuspenseWrapper> },
              { path: '*', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
            ],
          },
        ],
      },
    ],
  },
])
