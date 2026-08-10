import { CUSTOM_ALERT_MODULE_SUFFIX } from '@/lib/finance/calculations'
import type { CustomAlert, CustomAlertComparator, CustomAlertModule, CustomAlertSeverity } from '@/types/domain'

export const MODULE_META: Record<CustomAlertModule, { label: string; valueLabel: string }> = {
  SALDO: { label: 'Saldo', valueLabel: 'Saldo' },
  CUENTAS_POR_COBRAR: { label: 'Cuentas por Cobrar', valueLabel: 'Total por Cobrar' },
  CUENTAS_POR_PAGAR: { label: 'Cuentas por Pagar', valueLabel: 'Total por Pagar' },
  PRESUPUESTO_CONSUMIDO: { label: 'Presupuesto Consumido', valueLabel: '% Consumido (el más alto del mes)' },
  INGRESOS_HOY: { label: 'Ingresos de Hoy', valueLabel: 'Ingresos de hoy' },
}

export const COMPARATOR_LABEL: Record<CustomAlertComparator, string> = { MENOR_QUE: 'Es menor que', MAYOR_QUE: 'Es mayor que' }

export const SEVERITY_BADGE: Record<CustomAlertSeverity, 'neutral' | 'warning' | 'error'> = {
  INFO: 'neutral',
  ADVERTENCIA: 'warning',
  CRITICA: 'error',
}

export function conditionLine(a: CustomAlert): string {
  if (a.condition_type === 'VALOR_FIJO') return `${COMPARATOR_LABEL[a.comparator]} ${CUSTOM_ALERT_MODULE_SUFFIX[a.module]}${a.threshold}`
  if (a.condition_type === 'COMPARAR_MODULO') return `${COMPARATOR_LABEL[a.comparator]} ${MODULE_META[a.compare_module!].label}`
  const sentido = a.vencimiento_sentido === 'PROXIMA' ? 'Próxima a vencer en' : 'Atrasada más de'
  return `${sentido} ${a.threshold} día(s)`
}
