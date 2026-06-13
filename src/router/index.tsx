import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
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

export const router = createBrowserRouter([
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
])
