import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { BudgetCard } from './BudgetCard'
import { BudgetFormModal } from './BudgetFormModal'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { monthKey } from '@/lib/finance/calculations'

export function BudgetsPage() {
  const profile = useAuthStore((s) => s.profile)
  const isAdmin = profile?.role === 'ADMIN'
  const { budgets, isLoading, fetchAll } = useBudgetsStore()
  const transactions = useTransactionsStore((s) => s.transactions)
  const [modalOpen, setModalOpen] = useState(false)

  const month = monthKey(new Date().toISOString())

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  const monthBudgets = useMemo(() => budgets.filter((b) => b.month === month), [budgets, month])

  if (isLoading && budgets.length === 0) {
    return (
      <div className="fz-screen grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  return (
    <div className="fz-screen">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text">Presupuestos</h1>
        {isAdmin && (
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            Nuevo Presupuesto
          </Button>
        )}
      </div>

      {monthBudgets.length === 0 ? (
        <div className="py-12 text-center text-sm text-sec">Aún no hay presupuestos configurados para este mes.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {monthBudgets.map((b) => (
            <BudgetCard key={b.id} budget={b} transactions={transactions} />
          ))}
        </div>
      )}

      <BudgetFormModal open={modalOpen} onClose={() => setModalOpen(false)} month={month} />
    </div>
  )
}
