import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { AppLayout } from '../layouts/AppLayout'
import { ROUTES } from '../utils/constants'

import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { ExpensesPage } from '../features/expenses/pages/ExpensesPage'
import { CategoriesPage } from '../features/expenses/pages/CategoriesPage'
import { IncomesPage } from '../features/incomes/pages/IncomesPage'
import { DebtsListPage } from '../features/debts/pages/DebtsListPage'
import { DebtDetailPage } from '../features/debts/pages/DebtDetailPage'
import { CounterpartiesPage } from '../features/debts/pages/CounterpartiesPage'
import { ReportsPage } from '../features/reports/pages/ReportsPage'

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.EXPENSES, element: <ExpensesPage /> },
          { path: ROUTES.EXPENSES_CATEGORIES, element: <CategoriesPage /> },
          { path: ROUTES.INCOMES, element: <IncomesPage /> },
          { path: ROUTES.DEBTS, element: <DebtsListPage /> },
          { path: ROUTES.DEBT_DETAIL(':id'), element: <DebtDetailPage /> },
          { path: ROUTES.COUNTERPARTIES, element: <CounterpartiesPage /> },
          { path: ROUTES.REPORTS, element: <ReportsPage /> },
          { path: '*', element: <Navigate to={ROUTES.DASHBOARD} replace /> },
        ],
      },
    ],
  },
])
