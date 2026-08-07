import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { TransactionFilters, type TypeFilter } from './TransactionFilters'
import { TransactionListItem } from './TransactionListItem'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUIStore } from '@/store/useUIStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { calcPeriodSummary } from '@/lib/finance/calculations'
import { formatDOP } from '@/lib/finance/formatters'
import { Plus } from 'lucide-react'

export function TransactionsPage() {
  const [params] = useSearchParams()
  const transactions = useTransactionsStore((s) => s.transactions)
  const isLoading = useTransactionsStore((s) => s.isLoading)
  const openRegisterModal = useUIStore((s) => s.openRegisterModal)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>((params.get('tipo') as TypeFilter) ?? 'TODOS')

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== 'TODOS' && t.type !== typeFilter) return false
      if (search && !(t.description ?? '').toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, typeFilter, search])

  const summary = useMemo(() => calcPeriodSummary(filtered), [filtered])

  return (
    <div className="fz-screen">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text">Transacciones</h1>
        <Button icon={<Plus size={16} />} onClick={openRegisterModal} className="hidden md:inline-flex">
          Registrar
        </Button>
      </div>

      <TransactionFilters search={search} onSearch={setSearch} typeFilter={typeFilter} onTypeFilter={setTypeFilter} />

      <Card className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span className="text-sec">
          Ingresos: <span className="font-mono font-bold text-green">{formatDOP(summary.ingresos)}</span>
        </span>
        <span className="text-sec">
          Gastos: <span className="font-mono font-bold text-brown">{formatDOP(summary.gastos)}</span>
        </span>
        <span className="text-sec">
          Neto: <span className="font-mono font-bold text-green-d">{formatDOP(summary.ganancia)}</span>
        </span>
      </Card>

      {isLoading && transactions.length === 0 ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-sec">No hay transacciones que coincidan con el filtro.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((tx) => (
            <TransactionListItem key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  )
}
