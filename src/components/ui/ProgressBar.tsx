import { budgetThreshold } from '@/lib/finance/calculations'
import { cn } from '@/lib/utils/cn'

const fillClasses: Record<ReturnType<typeof budgetThreshold>, string> = {
  ok: 'bg-green',
  medio: 'bg-green',
  alerta: 'bg-warn',
  excedido: 'bg-error',
}

export function ProgressBar({ pct }: { pct: number }) {
  const level = budgetThreshold(pct)
  const width = Math.min(100, Math.max(0, pct))
  return (
    <div className="h-2.5 w-full rounded-full bg-pastel overflow-hidden">
      <div className={cn('h-full rounded-full transition-all', fillClasses[level])} style={{ width: `${width}%` }} />
    </div>
  )
}
