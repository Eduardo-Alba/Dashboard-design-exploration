import { useEffect, useMemo } from 'react'
import { evaluateAlerts, evaluateCustomAlerts, type ActiveAlert, type ActiveCustomAlert } from '@/lib/finance/calculations'
import { useAuthStore } from '@/store/useAuthStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { useAlertsStore } from '@/store/useAlertsStore'
import { useCustomAlertsStore } from '@/store/useCustomAlertsStore'

export interface UnifiedAlert {
  key: string
  message: string
}

export interface AlertsResult {
  fixed: ActiveAlert[]
  custom: ActiveCustomAlert[]
  combined: UnifiedAlert[]
}

/**
 * Recalcula las alertas activas "ahora" (predeterminadas + personalizadas) a partir del estado
 * vivo de los stores (patrón Observer). Corre en cualquier pantalla mientras el ADMIN tiene la
 * app abierta — de aquí sale tambien la sincronizacion que dispara el email real de las
 * personalizadas (useCustomAlertsStore.syncTriggerState), no solo el conteo/panel de la campana.
 */
export function useAlerts(): AlertsResult {
  const role = useAuthStore((s) => s.profile?.role)
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const budgets = useBudgetsStore((s) => s.budgets)
  const accounts = useAccountsStore((s) => s.accounts)
  const configs = useAlertsStore((s) => s.configs)
  const customAlerts = useCustomAlertsStore((s) => s.alerts)
  const syncTriggerState = useCustomAlertsStore((s) => s.syncTriggerState)

  const fixed = useMemo(() => {
    if (!business || role !== 'ADMIN') return []
    return evaluateAlerts(configs, business, transactions, budgets, accounts)
  }, [business, role, transactions, budgets, accounts, configs])

  const custom = useMemo(() => {
    if (!business || role !== 'ADMIN') return []
    return evaluateCustomAlerts(customAlerts, business, transactions, budgets, accounts)
  }, [business, role, customAlerts, transactions, budgets, accounts])

  useEffect(() => {
    void syncTriggerState(new Map(custom.map((c) => [c.id, c])))
  }, [custom, syncTriggerState])

  // Una regla "Avisar" ya descartada no vuelve a mostrarse hasta que se resuelva y dispare de
  // nuevo (mismo criterio que la lista en AlertsPage) — "Recordar" siempre reaparece.
  const customVisible = useMemo(() => {
    const byId = new Map(customAlerts.map((c) => [c.id, c]))
    return custom.filter((a) => {
      const rule = byId.get(a.id)
      return rule?.action === 'RECORDAR' || !rule?.dismissed
    })
  }, [custom, customAlerts])

  const combined = useMemo(
    () => [
      ...fixed.map((a) => ({ key: a.type, message: a.message })),
      ...customVisible.map((a) => ({ key: a.id, message: a.message })),
    ],
    [fixed, customVisible],
  )

  return { fixed, custom: customVisible, combined }
}
