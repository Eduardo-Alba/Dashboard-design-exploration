import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors cursor-pointer',
        active ? 'bg-green-strong text-white' : 'bg-surface text-sec border border-border hover:bg-pastel-soft',
      )}
    >
      {children}
    </button>
  )
}
