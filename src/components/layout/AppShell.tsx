import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { Topbar } from './Topbar'
import { useAuthStore } from '@/store/useAuthStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { useAlertsStore } from '@/store/useAlertsStore'
import { useCustomAlertsStore } from '@/store/useCustomAlertsStore'
import { ToastViewport } from '@/components/ui/Toast'
import { TransactionFormModal } from '@/features/transactions/TransactionFormModal'

export function AppShell() {
  const profile = useAuthStore((s) => s.profile)
  const businessId = profile?.business_id
  const role = profile?.role
  const canSeeGlobal = role === 'ADMIN' || role === 'CONTADOR'
  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    if (!businessId) return

    void useBusinessStore.getState().fetch(businessId)
    void useTransactionsStore.getState().fetchAll(businessId)
    const unsubTx = useTransactionsStore.getState().subscribe(businessId)

    let unsubBudgets: (() => void) | undefined
    let unsubAccounts: (() => void) | undefined
    if (canSeeGlobal) {
      void useBudgetsStore.getState().fetchAll(businessId)
      unsubBudgets = useBudgetsStore.getState().subscribe(businessId)
      void useAccountsStore.getState().fetchAll(businessId)
      unsubAccounts = useAccountsStore.getState().subscribe(businessId)
    }
    if (isAdmin) {
      void useAlertsStore.getState().fetchAll(businessId)
      void useCustomAlertsStore.getState().fetchAll(businessId)
    }

    return () => {
      unsubTx()
      unsubBudgets?.()
      unsubAccounts?.()
    }
  }, [businessId, canSeeGlobal, isAdmin])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-[1180px] flex-1 p-4 md:p-5 pb-24 md:pb-8">
          <Outlet />
        </main>
        <BottomNav />
      </div>
      <TransactionFormModal />
      <ToastViewport />
    </div>
  )
}
