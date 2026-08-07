import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-body">
      <span
        onClick={() => onChange(!checked)}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-[5px] border-2 transition-colors',
          checked ? 'border-green bg-green' : 'border-pastel bg-transparent',
        )}
      >
        {checked && <Check size={13} strokeWidth={3} className="text-white" />}
      </span>
      {label}
    </label>
  )
}
