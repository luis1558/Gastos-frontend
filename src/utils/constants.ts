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
  CARDS: '/cards',
  FIXED_PAYMENTS: '/fixed-payments',
  GOALS: '/goals',
  GOAL_DETAIL: (id: string) => `/goals/${id}`,
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

export const DEBT_DIRECTIONS = [
  { value: 'payable', label: 'Me prestaron', description: 'Yo debo pagar (por pagar)' },
  { value: 'receivable', label: 'Presté dinero', description: 'Me deben pagar (por cobrar)' },
] as const

export const INTEREST_TYPES = [
  { value: 'none', label: 'Sin interés', description: 'Se devuelve solo el monto prestado.' },
  { value: 'simple', label: 'Interés simple', description: 'Se calcula solo sobre el capital inicial; los intereses no generan más intereses.' },
  { value: 'compound', label: 'Interés compuesto', description: 'Los intereses se suman al capital, y el siguiente interés se calcula sobre una base mayor.' },
] as const

export const RATE_TYPES = [
  { value: 'fixed', label: 'Tasa fija', description: 'El porcentaje no cambia durante todo el plazo.' },
  { value: 'variable', label: 'Tasa variable', description: 'Cambia con el tiempo según un índice de referencia (ej. Euríbor). Tú registras los cambios.' },
] as const

export const RATE_PERIODS = [
  { value: 'annual', label: '% anual' },
  { value: 'monthly', label: '% mensual' },
] as const

export const GOAL_KINDS = [
  { value: 'debt', label: 'Préstamo', description: 'Aparta para la cuota de una deuda pendiente', available: true },
  { value: 'card', label: 'Pago de tarjeta', description: 'Aparta para el pago de una tarjeta', available: true },
  { value: 'fixed_payment', label: 'Pago fijo', description: 'Arriendo, internet, suscripciones…', available: true },
  { value: 'personal', label: 'Algo mío', description: 'Una compra, un viaje, ahorro para lo que quieras', available: true },
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
