import { useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatDOP } from '@/lib/finance/formatters'
import type { PeriodSummary } from '@/lib/finance/calculations'
import { cn } from '@/lib/utils/cn'

interface Props {
  saldoTotal: number
  summary: PeriodSummary
}

export function KpiGrid({ saldoTotal, summary }: Props) {
  const navigate = useNavigate()

  const kpis = [
    {
      label: 'Saldo Total',
      value: saldoTotal,
      icon: Wallet,
      tone: saldoTotal >= 0 ? 'text-green-d' : 'text-error',
      go: () => navigate('/transacciones'),
    },
    {
      label: 'Ingresos del período',
      value: summary.ingresos,
      icon: ArrowUpRight,
      tone: 'text-green',
      go: () => navigate('/transacciones?tipo=INGRESO'),
    },
    {
      label: 'Gastos del período',
      value: summary.gastos,
      icon: ArrowDownRight,
      tone: 'text-brown',
      go: () => navigate('/transacciones?tipo=GASTO'),
    },
    {
      label: 'Ganancia Neta',
      value: summary.ganancia,
      icon: TrendingUp,
      tone: 'text-green-d',
      sub: `Margen ${summary.margen.toFixed(1)}%`,
      go: () => navigate('/reportes'),
    },
  ]

  return (
    <div className="mb-4.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {kpis.map((k) => (
        <Card key={k.label} as="button" hoverable onClick={k.go} className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-sec">{k.label}</span>
            <k.icon size={16} className={k.tone} />
          </div>
          <div className={cn('font-mono text-lg font-bold md:text-xl', k.tone)}>{formatDOP(k.value)}</div>
          {k.sub && <div className="text-[11.5px] text-sec">{k.sub}</div>}
        </Card>
      ))}
    </div>
  )
}
