import { Chip } from '@/components/ui/Chip'
import type { Period } from '@/lib/finance/calculations'

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'todo', label: 'Personalizado' },
]

interface Props {
  period: Period
  onChange: (p: Period) => void
  customFrom: string
  customTo: string
  onCustomChange: (from: string, to: string) => void
}

export function PeriodSelector({ period, onChange, customFrom, customTo, onCustomChange }: Props) {
  return (
    <div className="mb-4.5 flex flex-wrap items-center gap-2">
      {OPTIONS.map((o) => (
        <Chip key={o.value} active={period === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </Chip>
      ))}
      {period === 'todo' && (
        <div className="flex items-center gap-1.5 text-sm">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomChange(e.target.value, customTo)}
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-body"
          />
          <span className="text-sec">–</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomChange(customFrom, e.target.value)}
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-body"
          />
        </div>
      )}
    </div>
  )
}
