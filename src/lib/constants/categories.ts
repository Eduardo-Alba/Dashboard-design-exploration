import type { ExpenseCategory, IncomeCategory, TransactionCategory } from '@/types/domain'

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'VENTAS',
  'SERVICIOS',
  'PRESTAMO_RECIBIDO',
  'OTROS_INGRESOS',
]

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'INVENTARIO',
  'SALARIOS',
  'SERVICIOS_BASICOS',
  'RENTA',
  'TRANSPORTE',
  'OTROS_GASTOS',
]

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  VENTAS: 'Ventas',
  SERVICIOS: 'Servicios',
  PRESTAMO_RECIBIDO: 'Préstamo recibido',
  OTROS_INGRESOS: 'Otros ingresos',
  INVENTARIO: 'Inventario',
  SALARIOS: 'Salarios',
  SERVICIOS_BASICOS: 'Servicios (luz/agua)',
  RENTA: 'Renta',
  TRANSPORTE: 'Transporte',
  OTROS_GASTOS: 'Otros gastos',
}
