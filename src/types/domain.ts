export type UserRole = 'ADMIN' | 'CAJERO' | 'CONTADOR'

export type TransactionType = 'INGRESO' | 'GASTO'

export type IncomeCategory = 'VENTAS' | 'SERVICIOS' | 'PRESTAMO_RECIBIDO' | 'OTROS_INGRESOS'
export type ExpenseCategory =
  | 'INVENTARIO'
  | 'SALARIOS'
  | 'SERVICIOS_BASICOS'
  | 'RENTA'
  | 'TRANSPORTE'
  | 'OTROS_GASTOS'
export type TransactionCategory = IncomeCategory | ExpenseCategory

export type AccountDirection = 'COBRAR' | 'PAGAR'
export type AccountStatus = 'PENDIENTE' | 'PAGADO' | 'VENCIDA'

export type AlertType = 'PRESUPUESTO' | 'BALANCE' | 'MESES_NEG' | 'DEUDA' | 'INGRESO_BAJO'
export type AlertChannel = 'EMAIL' | 'WHATSAPP' | 'IN_APP'

export type CustomAlertModule = 'SALDO' | 'CUENTAS_POR_COBRAR' | 'CUENTAS_POR_PAGAR' | 'PRESUPUESTO_CONSUMIDO' | 'INGRESOS_HOY'
export type CustomAlertComparator = 'MENOR_QUE' | 'MAYOR_QUE'
export type CustomAlertAction = 'AVISAR' | 'RECORDAR'
export type CustomAlertSeverity = 'INFO' | 'ADVERTENCIA' | 'CRITICA'
export type CustomAlertConditionType = 'VALOR_FIJO' | 'COMPARAR_MODULO' | 'VENCIMIENTO'
export type CustomAlertVencimientoSentido = 'ATRASADA' | 'PROXIMA'

export interface Business {
  id: string
  name: string
  rubro: string
  rnc: string | null
  initial_balance: number
  currency: string
  created_at: string
}

export interface Profile {
  id: string
  business_id: string
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  last_login: string | null
  created_at: string
}

export interface Transaction {
  id: string
  business_id: string
  user_id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string | null
  occurred_at: string
  document_url: string | null
  created_at: string
}

export interface Budget {
  id: string
  business_id: string
  category: TransactionCategory
  limit_amount: number
  month: string // "YYYY-MM"
  created_at: string
}

export interface AlertConfig {
  id: string
  business_id: string
  type: AlertType
  is_active: boolean
  threshold: number | null
  channels: AlertChannel[]
  updated_at: string
}

export interface CustomAlert {
  id: string
  business_id: string
  label: string
  module: CustomAlertModule
  condition_type: CustomAlertConditionType
  comparator: CustomAlertComparator
  threshold: number | null
  compare_module: CustomAlertModule | null
  vencimiento_sentido: CustomAlertVencimientoSentido
  action: CustomAlertAction
  severity: CustomAlertSeverity
  channels: AlertChannel[]
  custom_message: string | null
  is_active: boolean
  was_triggered: boolean
  dismissed: boolean
  created_at: string
}

export interface AccountEntry {
  id: string
  business_id: string
  direction: AccountDirection
  party: string
  amount: number
  due_date: string // "YYYY-MM-DD"
  status: AccountStatus
  created_at: string
  updated_at: string
}
