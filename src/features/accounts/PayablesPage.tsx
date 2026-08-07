import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AccountCard } from './AccountCard'
import { AccountFormModal } from './AccountFormModal'
import { CashFlowRiskBanner } from './CashFlowRiskBanner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { calcCashFlowRisk, calcSaldoTotal, displayStatus } from '@/lib/finance/calculations'
import { formatDOP } from '@/lib/finance/formatters'

export function PayablesPage() {
  const profile = useAuthStore((s) => s.profile)
  const isAdmin = profile?.role === 'ADMIN'
  const { accounts, isLoading, fetchAll, markPaid } = useAccountsStore()
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  const payables = useMemo(() => accounts.filter((a) => a.direction === 'PAGAR'), [accounts])
  const pendiente = payables.filter((a) => displayStatus(a) !== 'PAGADO').reduce((s, a) => s + a.amount, 0)

  const saldo = business ? calcSaldoTotal(business, transactions) : 0
  const risk = useMemo(() => calcCashFlowRisk(saldo, accounts), [saldo, accounts])

  if (isLoading && accounts.length === 0) {
    return (
      <div className="fz-screen flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    )
  }

  return (
    <div className="fz-screen">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-text">Cuentas por Pagar</h1>
          <div className="text-sm text-sec">
            Por pagar: <span className="font-mono font-bold text-body">{formatDOP(pendiente)}</span>
          </div>
        </div>
        {isAdmin && (
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            Nuevo Pago
          </Button>
        )}
      </div>

      {risk.atRisk && <CashFlowRiskBanner shortfall={risk.shortfall} />}

      {payables.length === 0 ? (
        <div className="py-12 text-center text-sm text-sec">No hay cuentas por pagar registradas.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {payables.map((a) => (
            <AccountCard key={a.id} account={a} onMarkPaid={isAdmin ? markPaid : undefined} />
          ))}
        </div>
      )}

      <Card className="mt-4 text-sm text-sec">
        Por pagar: <span className="font-mono font-bold text-body">{formatDOP(pendiente)}</span>
      </Card>

      <AccountFormModal open={modalOpen} onClose={() => setModalOpen(false)} direction="PAGAR" />
    </div>
  )
}
