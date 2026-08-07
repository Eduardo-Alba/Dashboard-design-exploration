import { useMemo } from 'react'
import { evaluateAlerts, type ActiveAlert } from '@/lib/finance/calculations'
import { useAuthStore } from '@/store/useAuthStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { useAlertsStore } from '@/store/useAlertsStore'

/** Recalcula las alertas activas "ahora" a partir del estado vivo de los stores (patrón Observer). */
export function useAlerts(): ActiveAlert[] {
  const role = useAuthStore((s) => s.profile?.role)
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const budgets = useBudgetsStore((s) => s.budgets)
  const accounts = useAccountsStore((s) => s.accounts)
  const configs = useAlertsStore((s) => s.configs)

  return useMemo(() => {
    if (!business || role !== 'ADMIN') return []
    return evaluateAlerts(configs, business, transactions, budgets, accounts)
  }, [business, role, transactions, budgets, accounts, configs])
}
