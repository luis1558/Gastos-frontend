export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  EXPENSES: '/expenses',
  EXPENSES_CATEGORIES: '/expenses/categories',
  INCOMES: '/incomes',
  DEBTS: '/debts',
  DEBT_DETAIL: (id: string) => `/debts/${id}`,
  COUNTERPARTIES: '/debts/counterparties',
  REPORTS: '/reports',
} as const

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'debit_card', label: 'Tarjeta Débito' },
  { value: 'credit_card', label: 'Tarjeta Crédito' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'digital_wallet', label: 'Billetera Digital' },
  { value: 'other', label: 'Otro' },
] as const

export const DEBT_TYPES = [
  { value: 'receivable', label: 'Por cobrar' },
  { value: 'payable', label: 'Por pagar' },
] as const

export const DEBT_STATUSES: { value: string; label: string; color: string }[] = [
  { value: 'pending', label: 'Pendiente', color: 'yellow' },
  { value: 'partially_paid', label: 'Parcial', color: 'blue' },
  { value: 'paid', label: 'Pagado', color: 'green' },
  { value: 'cancelled', label: 'Cancelado', color: 'gray' },
]

export const COUNTERPARTY_TYPES = [
  { value: 'person', label: 'Persona' },
  { value: 'bank', label: 'Banco' },
  { value: 'business', label: 'Negocio' },
  { value: 'family', label: 'Familia' },
  { value: 'friend', label: 'Amigo' },
  { value: 'other', label: 'Otro' },
] as const

export const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
