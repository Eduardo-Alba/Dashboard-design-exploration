import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { displayStatus } from '@/lib/finance/calculations'
import { formatDOP } from '@/lib/finance/formatters'
import type { AccountEntry } from '@/types/domain'

function daysUntil(dueDate: string): number {
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000)
}

export function AccountCard({
  account,
  onMarkPaid,
}: {
  account: AccountEntry
  onMarkPaid?: (id: string) => void
}) {
  const status = displayStatus(account)
  const dias = daysUntil(account.due_date)
  const dateStr = new Date(account.due_date).toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit' })

  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <div className="font-bold text-text">{account.party}</div>
        <div className="font-mono text-sm text-body">{formatDOP(account.amount)}</div>
        <div className="text-[12.5px] text-sec">
          {status === 'PAGADO' ? 'Pagado' : status === 'VENCIDA' ? `Venció ${dateStr} (hace ${Math.abs(dias)}d)` : `Vence ${dateStr} (${dias}d)`}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Badge variant={status === 'VENCIDA' ? 'error' : status === 'PAGADO' ? 'success' : 'neutral'}>
          {status === 'PENDIENTE' ? 'PENDIENTE' : status === 'VENCIDA' ? 'VENCIDA' : 'PAGADO'}
        </Badge>
        {status !== 'PAGADO' && onMarkPaid && (
          <Button variant="outline" className="px-3 py-1.5 text-xs" icon={<CheckCircle2 size={14} />} onClick={() => onMarkPaid(account.id)}>
            Marcar pagado
          </Button>
        )}
      </div>
    </Card>
  )
}
