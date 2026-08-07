import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { TransactionListItem } from '@/features/transactions/TransactionListItem'
import type { Transaction } from '@/types/domain'

export function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
  const navigate = useNavigate()
  const recent = transactions.slice(0, 3)

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-bold text-text">Últimos movimientos</div>
        <button type="button" onClick={() => navigate('/transacciones')} className="text-[13px] font-semibold text-teal cursor-pointer">
          Ver todos
        </button>
      </div>
      {recent.length === 0 ? (
        <div className="py-6 text-center text-sm text-sec">Aún no hay movimientos registrados.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {recent.map((tx) => (
            <TransactionListItem key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </Card>
  )
}
