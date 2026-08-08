import { EXPENSE_CATEGORIES } from '@/lib/constants/categories'
import type {
  AccountDirection,
  AccountEntry,
  AlertConfig,
  Budget,
  Business,
  CustomAlert,
  CustomAlertComparator,
  CustomAlertConditionType,
  CustomAlertModule,
  CustomAlertSeverity,
  Transaction,
} from '@/types/domain'

export type Period = 'hoy' | 'semana' | 'mes' | 'todo'

/**
 * "YYYY-MM" en la zona horaria LOCAL del navegador (no UTC). `iso.slice(0,7)` sobre un
 * timestamp UTC puede caer en el mes equivocado cerca de medianoche — todo el bucketing por
 * mes debe pasar por aquí para quedar consistente con periodRange/inPeriod (que ya usan Date
 * local) en vez de mezclar UTC y local.
 */
export function monthKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function periodRange(period: Period, now = new Date()): { from: Date; to: Date } {
  const to = new Date(now)
  const from = new Date(now)
  if (period === 'hoy') {
    from.setHours(0, 0, 0, 0)
  } else if (period === 'semana') {
    from.setDate(from.getDate() - 7)
  } else if (period === 'mes') {
    from.setDate(1)
    from.setHours(0, 0, 0, 0)
  } else {
    from.setFullYear(1970)
  }
  return { from, to }
}

export function inPeriod(tx: Transaction, period: Period, now = new Date()): boolean {
  const { from, to } = periodRange(period, now)
  const d = new Date(tx.occurred_at)
  return d >= from && d <= to
}

export function filterByRange(transactions: Transaction[], from: Date, to: Date): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.occurred_at)
    return d >= from && d <= to
  })
}

function sumBy(transactions: Transaction[], type: Transaction['type']): number {
  return transactions.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0)
}

/** Regla 1: saldo total = saldo inicial + Σingresos − Σgastos (histórico completo, no por periodo). */
export function calcSaldoTotal(business: Business, allTransactions: Transaction[]): number {
  return business.initial_balance + sumBy(allTransactions, 'INGRESO') - sumBy(allTransactions, 'GASTO')
}

export interface PeriodSummary {
  ingresos: number
  gastos: number
  ganancia: number
  margen: number
}

/** Reglas 2-3: ganancia neta y margen del periodo. */
export function calcPeriodSummary(transactions: Transaction[]): PeriodSummary {
  const ingresos = sumBy(transactions, 'INGRESO')
  const gastos = sumBy(transactions, 'GASTO')
  const ganancia = ingresos - gastos
  const margen = ingresos > 0 ? (ganancia / ingresos) * 100 : 0
  return { ingresos, gastos, ganancia, margen }
}

/** Regla 4: consumo de presupuesto = Σgastos de la categoría en el mes ÷ límite × 100. */
export function calcBudgetConsumption(budget: Budget, transactions: Transaction[]): { consumed: number; pct: number } {
  const consumed = transactions
    .filter((t) => t.type === 'GASTO' && t.category === budget.category && monthKey(t.occurred_at) === budget.month)
    .reduce((acc, t) => acc + t.amount, 0)
  const pct = budget.limit_amount > 0 ? (consumed / budget.limit_amount) * 100 : 0
  return { consumed, pct }
}

export type BudgetThreshold = 'ok' | 'medio' | 'alerta' | 'excedido'

export function budgetThreshold(pct: number): BudgetThreshold {
  if (pct >= 100) return 'excedido'
  if (pct >= 90) return 'alerta'
  if (pct >= 50) return 'medio'
  return 'ok'
}

/** Regla 7: una cuenta PENDIENTE cuya fecha ya pasó se muestra como VENCIDA (sin mutar el valor guardado). */
export function displayStatus(account: AccountEntry, now = new Date()): AccountEntry['status'] {
  if (account.status === 'PENDIENTE' && new Date(account.due_date) < now) return 'VENCIDA'
  return account.status
}

/** Cuentas de una direccion que todavia cuentan para el total pendiente (no pagadas). */
function pendingAccounts(accounts: AccountEntry[], direction: AccountDirection): AccountEntry[] {
  return accounts.filter((a) => a.direction === direction && a.status !== 'PAGADO')
}

/** Regla 8: flujo de caja en riesgo si (saldo + por cobrar pendiente) < por pagar pendiente. */
export function calcCashFlowRisk(saldo: number, accounts: AccountEntry[]): { atRisk: boolean; shortfall: number } {
  const porCobrar = pendingAccounts(accounts, 'COBRAR').reduce((acc, a) => acc + a.amount, 0)
  const porPagar = pendingAccounts(accounts, 'PAGAR').reduce((acc, a) => acc + a.amount, 0)
  const disponible = saldo + porCobrar
  return { atRisk: disponible < porPagar, shortfall: Math.max(0, porPagar - disponible) }
}

export interface ActiveAlert {
  type: AlertConfig['type']
  message: string
}

/**
 * Reglas 5-6 + config de alertas (brief §5.7): evalúa qué alertas activas deben mostrarse
 * "ahora" combinando la config guardada con los datos vivos. Sin tabla de historial (fuera de
 * alcance, ver plan) — esto siempre recalcula desde el estado actual.
 */
export function evaluateAlerts(
  configs: AlertConfig[],
  business: Business,
  allTransactions: Transaction[],
  budgets: Budget[],
  accounts: AccountEntry[],
): ActiveAlert[] {
  const active = new Map(configs.filter((c) => c.is_active).map((c) => [c.type, c]))
  const alerts: ActiveAlert[] = []
  const saldo = calcSaldoTotal(business, allTransactions)
  const now = new Date()
  const currentMonth = monthKey(now.toISOString())

  const presupuesto = active.get('PRESUPUESTO')
  if (presupuesto) {
    for (const b of budgets.filter((x) => x.month === currentMonth)) {
      const { pct } = calcBudgetConsumption(b, allTransactions)
      if (pct >= 90) {
        alerts.push({ type: 'PRESUPUESTO', message: `Presupuesto ${b.category}: ${Math.round(pct)}% consumido` })
      }
    }
  }

  const balance = active.get('BALANCE')
  if (balance && balance.threshold != null && saldo < balance.threshold) {
    alerts.push({ type: 'BALANCE', message: `Saldo bajo: apenas te quedan RD$${saldo.toFixed(2)}` })
  }

  const deuda = active.get('DEUDA')
  if (deuda) {
    const diasAviso = deuda.threshold ?? 7
    for (const a of accounts.filter((x) => x.direction === 'COBRAR' && x.status === 'PENDIENTE')) {
      const dias = Math.ceil((new Date(a.due_date).getTime() - now.getTime()) / 86_400_000)
      if (dias >= 0 && dias <= diasAviso) {
        alerts.push({ type: 'DEUDA', message: `Deuda de ${a.party} vence en ${dias} día(s)` })
      }
    }
  }

  const ingresoBajo = active.get('INGRESO_BAJO')
  if (ingresoBajo && ingresoBajo.threshold != null) {
    const hoy = allTransactions.filter((t) => inPeriod(t, 'hoy', now))
    const ingresosHoy = sumBy(hoy, 'INGRESO')
    if (ingresosHoy < ingresoBajo.threshold) {
      alerts.push({ type: 'INGRESO_BAJO', message: `Ingresos de hoy (RD$${ingresosHoy.toFixed(2)}) por debajo de lo esperado` })
    }
  }

  return alerts
}

export interface ActiveCustomAlert {
  id: string
  label: string
  action: 'AVISAR' | 'RECORDAR'
  severity: CustomAlertSeverity
  message: string
}

/**
 * Comparadores validos por modulo bajo condicion VALOR_FIJO (logica de negocio real de cada
 * uno, no un generico menor/mayor para todos): un % de presupuesto consumido solo alerta si SE
 * PASA de un umbral (nunca "menor que"), un ingreso bajo solo alerta si CAE por debajo (nunca
 * "mayor que"). COMPARAR_MODULO siempre admite ambos sentidos, sin importar el modulo.
 */
export const CUSTOM_ALERT_MODULE_COMPARATORS: Record<CustomAlertModule, CustomAlertComparator[]> = {
  SALDO: ['MENOR_QUE', 'MAYOR_QUE'],
  CUENTAS_POR_COBRAR: ['MENOR_QUE', 'MAYOR_QUE'],
  CUENTAS_POR_PAGAR: ['MENOR_QUE', 'MAYOR_QUE'],
  PRESUPUESTO_CONSUMIDO: ['MAYOR_QUE'],
  INGRESOS_HOY: ['MENOR_QUE'],
}

/**
 * Tipos de condicion validos por modulo: Presupuesto Consumido (%) e Ingresos de Hoy (flujo del
 * dia) solo admiten Valor fijo — no son comparables entre modulos ni tienen due_date por fila
 * para calcular vencimiento. Los 3 modulos en RD$ admiten Comparar modulo; solo los 2
 * respaldados por AccountEntry (con due_date) admiten Vencimiento.
 */
export const CUSTOM_ALERT_MODULE_CONDITION_TYPES: Record<CustomAlertModule, CustomAlertConditionType[]> = {
  SALDO: ['VALOR_FIJO', 'COMPARAR_MODULO'],
  CUENTAS_POR_COBRAR: ['VALOR_FIJO', 'COMPARAR_MODULO', 'VENCIMIENTO'],
  CUENTAS_POR_PAGAR: ['VALOR_FIJO', 'COMPARAR_MODULO', 'VENCIMIENTO'],
  PRESUPUESTO_CONSUMIDO: ['VALOR_FIJO'],
  INGRESOS_HOY: ['VALOR_FIJO'],
}

/** Modulos objetivo validos para Comparar modulo, por modulo de origen. */
export const CUSTOM_ALERT_COMPARE_TARGETS: Record<CustomAlertModule, CustomAlertModule[]> = {
  SALDO: ['CUENTAS_POR_COBRAR', 'CUENTAS_POR_PAGAR'],
  CUENTAS_POR_COBRAR: ['SALDO', 'CUENTAS_POR_PAGAR'],
  CUENTAS_POR_PAGAR: ['SALDO', 'CUENTAS_POR_COBRAR'],
  PRESUPUESTO_CONSUMIDO: [],
  INGRESOS_HOY: [],
}

export const CUSTOM_ALERT_MODULE_SUFFIX: Record<CustomAlertModule, string> = {
  SALDO: 'RD$',
  CUENTAS_POR_COBRAR: 'RD$',
  CUENTAS_POR_PAGAR: 'RD$',
  PRESUPUESTO_CONSUMIDO: '%',
  INGRESOS_HOY: 'RD$',
}

function formatCustomAlertValue(module: CustomAlertModule, value: number): string {
  return module === 'PRESUPUESTO_CONSUMIDO' ? Math.round(value).toString() : value.toFixed(2)
}

/** Modulo experimental (ver AlertsPage): evalua las reglas dinamicas creadas por el usuario. */
export function evaluateCustomAlerts(
  customAlerts: CustomAlert[],
  business: Business,
  allTransactions: Transaction[],
  budgets: Budget[],
  accounts: AccountEntry[],
): ActiveCustomAlert[] {
  const now = new Date()
  const saldo = calcSaldoTotal(business, allTransactions)
  const porCobrar = pendingAccounts(accounts, 'COBRAR').reduce((acc, a) => acc + a.amount, 0)
  const porPagar = pendingAccounts(accounts, 'PAGAR').reduce((acc, a) => acc + a.amount, 0)
  const presupuestoMaxPct = Math.max(
    0,
    ...budgets.filter((b) => b.month === monthKey(now.toISOString())).map((b) => calcBudgetConsumption(b, allTransactions).pct),
  )
  const ingresosHoy = sumBy(allTransactions.filter((t) => inPeriod(t, 'hoy', now)), 'INGRESO')

  const valueByModule: Record<CustomAlertModule, number> = {
    SALDO: saldo,
    CUENTAS_POR_COBRAR: porCobrar,
    CUENTAS_POR_PAGAR: porPagar,
    PRESUPUESTO_CONSUMIDO: presupuestoMaxPct,
    INGRESOS_HOY: ingresosHoy,
  }

  function autoMessage(c: CustomAlert, formattedValue: string): string {
    return c.custom_message
      ? c.custom_message.replaceAll('{valor}', formattedValue)
      : `${c.label}: valor actual ${formattedValue}${CUSTOM_ALERT_MODULE_SUFFIX[c.module]}`
  }

  return customAlerts.filter((c) => c.is_active).flatMap((c): ActiveCustomAlert[] => {
    if (c.condition_type === 'VALOR_FIJO') {
      if (c.threshold == null || !CUSTOM_ALERT_MODULE_COMPARATORS[c.module].includes(c.comparator)) return []
      const value = valueByModule[c.module]
      const matches = c.comparator === 'MENOR_QUE' ? value < c.threshold : value > c.threshold
      if (!matches) return []
      const formattedValue = formatCustomAlertValue(c.module, value)
      return [{ id: c.id, label: c.label, action: c.action, severity: c.severity, message: autoMessage(c, formattedValue) }]
    }

    if (c.condition_type === 'COMPARAR_MODULO') {
      if (!c.compare_module) return []
      const value = valueByModule[c.module]
      const compareValue = valueByModule[c.compare_module]
      const matches = c.comparator === 'MENOR_QUE' ? value < compareValue : value > compareValue
      if (!matches) return []
      const formattedValue = formatCustomAlertValue(c.module, value)
      const formattedCompare = formatCustomAlertValue(c.compare_module, compareValue)
      const sentido = c.comparator === 'MENOR_QUE' ? 'menor que' : 'mayor que'
      const defaultMessage = `${c.label}: ${CUSTOM_ALERT_MODULE_SUFFIX[c.module]}${formattedValue} es ${sentido} ${CUSTOM_ALERT_MODULE_SUFFIX[c.compare_module]}${formattedCompare}`
      const message = c.custom_message
        ? c.custom_message.replaceAll('{valor}', formattedValue).replaceAll('{valor_comparado}', formattedCompare)
        : defaultMessage
      return [{ id: c.id, label: c.label, action: c.action, severity: c.severity, message }]
    }

    // VENCIMIENTO
    if (c.threshold == null) return []
    const direction = c.module === 'CUENTAS_POR_COBRAR' ? 'COBRAR' : 'PAGAR'
    const matches = pendingAccounts(accounts, direction)
      .map((a) => ({
        account: a,
        diasAtraso: Math.floor((now.getTime() - new Date(a.due_date).getTime()) / 86_400_000),
        diasRestantes: Math.ceil((new Date(a.due_date).getTime() - now.getTime()) / 86_400_000),
      }))
      .filter(({ diasAtraso, diasRestantes }) =>
        c.vencimiento_sentido === 'PROXIMA' ? diasRestantes >= 0 && diasRestantes <= c.threshold! : diasAtraso > c.threshold!,
      )
    if (matches.length === 0) return []
    const nombrados = matches
      .slice(0, 3)
      .map(({ account, diasAtraso, diasRestantes }) => `${account.party} (${c.vencimiento_sentido === 'PROXIMA' ? diasRestantes : diasAtraso}d)`)
      .join(', ')
    const resto = matches.length > 3 ? ` y ${matches.length - 3} más` : ''
    const verbo = c.vencimiento_sentido === 'PROXIMA' ? 'próximas a vencer' : 'atrasadas'
    const defaultMessage = `${matches.length} cuenta(s) ${verbo}: ${nombrados}${resto}`
    const message = c.custom_message ? autoMessage(c, matches.length.toString()) : defaultMessage
    return [{ id: c.id, label: c.label, action: c.action, severity: c.severity, message }]
  })
}

/** Desglose de gastos por categoría del periodo, para la gráfica de dona y el reporte. */
export function calcCategoryBreakdown(transactions: Transaction[]): { category: string; amount: number; pct: number }[] {
  const gastos = transactions.filter((t) => t.type === 'GASTO')
  const total = gastos.reduce((acc, t) => acc + t.amount, 0)
  const byCategory = new Map<string, number>()
  for (const cat of EXPENSE_CATEGORIES) byCategory.set(cat, 0)
  for (const t of gastos) byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount)
  return [...byCategory.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount, pct: total > 0 ? (amount / total) * 100 : 0 }))
}
