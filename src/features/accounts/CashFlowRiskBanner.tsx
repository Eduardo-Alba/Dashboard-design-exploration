import { AlertTriangle } from 'lucide-react'
import { formatDOP } from '@/lib/finance/formatters'

export function CashFlowRiskBanner({ shortfall }: { shortfall: number }) {
  return (
    <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-warn/30 bg-warn-bg px-4 py-3 text-sm font-semibold text-warn">
      <AlertTriangle size={18} className="shrink-0" />
      Flujo de caja en riesgo. Necesitas {formatDOP(shortfall)} para cubrir pagos próximos.
    </div>
  )
}
