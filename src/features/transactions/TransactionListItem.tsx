import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import { formatDOP, formatDateTime } from '@/lib/finance/formatters'
import { cn } from '@/lib/utils/cn'
import type { Transaction } from '@/types/domain'

export function TransactionListItem({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === 'INGRESO'
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border-l-4 bg-surface px-3.5 py-3',
        isIncome ? 'border-l-green' : 'border-l-brown',
      )}
    >
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', isIncome ? 'bg-pastel text-green-d' : 'bg-brown-bg text-brown')}>
        {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-body">{tx.description || CATEGORY_LABELS[tx.category]}</div>
        <div className="text-[12px] text-sec">
          {formatDateTime(tx.occurred_at)} · {CATEGORY_LABELS[tx.category]}
        </div>
      </div>
      <div className={cn('shrink-0 font-mono text-sm font-bold', isIncome ? 'text-green' : 'text-brown')}>
        {isIncome ? '+' : '−'}
        {formatDOP(tx.amount)}
      </div>
    </div>
  )
}
