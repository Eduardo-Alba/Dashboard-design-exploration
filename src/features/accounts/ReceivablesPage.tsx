import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AccountCard } from './AccountCard'
import { AccountFormModal } from './AccountFormModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { displayStatus } from '@/lib/finance/calculations'
import { formatDOP } from '@/lib/finance/formatters'

export function ReceivablesPage() {
  const profile = useAuthStore((s) => s.profile)
  const isAdmin = profile?.role === 'ADMIN'
  const { accounts, isLoading, fetchAll, markPaid } = useAccountsStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  const receivables = useMemo(() => accounts.filter((a) => a.direction === 'COBRAR'), [accounts])
  const pendiente = receivables.filter((a) => displayStatus(a) !== 'PAGADO').reduce((s, a) => s + a.amount, 0)
  const vencido = receivables.filter((a) => displayStatus(a) === 'VENCIDA').reduce((s, a) => s + a.amount, 0)

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
          <h1 className="text-xl font-extrabold text-text">Cuentas por Cobrar</h1>
          <div className="text-sm text-sec">
            Por cobrar: <span className="font-mono font-bold text-body">{formatDOP(pendiente)}</span>
          </div>
        </div>
        {isAdmin && (
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
            Nueva Deuda
          </Button>
        )}
      </div>

      {receivables.length === 0 ? (
        <div className="py-12 text-center text-sm text-sec">No hay cuentas por cobrar registradas.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {receivables.map((a) => (
            <AccountCard key={a.id} account={a} onMarkPaid={isAdmin ? markPaid : undefined} />
          ))}
        </div>
      )}

      <Card className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-sec">
          Pendiente: <span className="font-mono font-bold text-body">{formatDOP(pendiente - vencido)}</span>
        </span>
        <span className="text-sec">
          Vencido: <span className="font-mono font-bold text-error">{formatDOP(vencido)}</span>
        </span>
      </Card>

      <AccountFormModal open={modalOpen} onClose={() => setModalOpen(false)} direction="COBRAR" />
    </div>
  )
}
