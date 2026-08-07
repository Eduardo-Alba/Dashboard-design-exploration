import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CreditCard, TrendingDown, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { ActiveAlert } from '@/lib/finance/calculations'

const ICONS: Record<ActiveAlert['type'], typeof AlertTriangle> = {
  PRESUPUESTO: Wallet,
  BALANCE: TrendingDown,
  MESES_NEG: TrendingDown,
  DEUDA: CreditCard,
  INGRESO_BAJO: AlertTriangle,
}

const ROUTES: Record<ActiveAlert['type'], string> = {
  PRESUPUESTO: '/presupuestos',
  BALANCE: '/reportes',
  MESES_NEG: '/reportes',
  DEUDA: '/cuentas-por-cobrar',
  INGRESO_BAJO: '/transacciones',
}

export function AlertsWidget({ alerts }: { alerts: ActiveAlert[] }) {
  const navigate = useNavigate()
  if (alerts.length === 0) return null

  return (
    <Card className="mb-4.5 flex flex-col gap-2 bg-warn-bg border-warn/30">
      <div className="text-[13px] font-bold text-warn">⚠ Alertas activas</div>
      {alerts.slice(0, 3).map((a, i) => {
        const Icon = ICONS[a.type]
        return (
          <button
            key={i}
            type="button"
            onClick={() => navigate(ROUTES[a.type])}
            className="flex items-center gap-2.5 rounded-lg bg-surface-2/60 px-3 py-2 text-left text-sm text-body cursor-pointer hover:bg-surface-2"
          >
            <Icon size={16} className="shrink-0 text-warn" />
            {a.message}
          </button>
        )
      })}
    </Card>
  )
}
