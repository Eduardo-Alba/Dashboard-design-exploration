import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { budgetThreshold, calcBudgetConsumption } from '@/lib/finance/calculations'
import { CATEGORY_LABELS } from '@/lib/constants/categories'
import { formatDOP } from '@/lib/finance/formatters'
import { cn } from '@/lib/utils/cn'
import type { Budget, Transaction } from '@/types/domain'

export function BudgetCard({ budget, transactions }: { budget: Budget; transactions: Transaction[] }) {
  const { consumed, pct } = calcBudgetConsumption(budget, transactions)
  const level = budgetThreshold(pct)
  const isWarn = level === 'alerta'
  const isOver = level === 'excedido'

  return (
    <Card className={cn(isOver && 'bg-error-bg border-error/30', isWarn && 'bg-warn-bg border-warn/30')}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold text-text">{CATEGORY_LABELS[budget.category]}</span>
        {(isWarn || isOver) && <AlertTriangle size={16} className={isOver ? 'text-error' : 'text-warn'} />}
      </div>
      <div className="mb-2 text-[13px] text-sec">
        Límite: {formatDOP(budget.limit_amount)} · Consumido: {formatDOP(consumed)}
      </div>
      <ProgressBar pct={pct} />
      <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
        <span className={cn('font-bold', isOver ? 'text-error' : isWarn ? 'text-warn' : 'text-sec')}>
          {pct.toFixed(0)}% {isOver && '🚨 Excedido'} {isWarn && '⚠️'}
        </span>
      </div>
    </Card>
  )
}
