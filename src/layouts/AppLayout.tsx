import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { FiLayout, FiDollarSign, FiTrendingUp, FiPieChart, FiMenu, FiX, FiLogOut, FiUser, FiGrid, FiCreditCard } from 'react-icons/fi'
import { useAuthStore } from '../stores/authStore'
import { ROUTES } from '../utils/constants'
import { classNames } from '../utils/format'

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: FiLayout },
  { to: ROUTES.EXPENSES, label: 'Gastos', icon: FiDollarSign },
  { to: ROUTES.INCOMES, label: 'Ingresos', icon: FiTrendingUp },
  { to: ROUTES.DEBTS, label: 'Deudas', icon: FiCreditCard },
  { to: ROUTES.REPORTS, label: 'Reportes', icon: FiPieChart },
]

const bottomNavItems = [
  { to: ROUTES.DASHBOARD, label: 'Inicio', icon: FiGrid },
  { to: ROUTES.EXPENSES, label: 'Gastos', icon: FiDollarSign },
  { to: ROUTES.DEBTS, label: 'Deudas', icon: FiCreditCard },
  { to: ROUTES.REPORTS, label: 'Reportes', icon: FiPieChart },
]

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <FiMenu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">G</span>
          </div>
          <span className="font-semibold text-gray-900">Gastos</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-white">G</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">Gastos</span>
              <p className="text-xs text-gray-500">App</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.DASHBOARD}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <FiUser size={16} className="text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.full_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
          >
            <FiLogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 lg:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map((item) => {
            const isActive = item.to === ROUTES.DASHBOARD
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.DASHBOARD}
                className={classNames(
                  'flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors',
                  isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
