import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
  as?: 'div' | 'button'
}

export function Card({ hoverable, as = 'div', className, children, ...rest }: CardProps) {
  const Comp = as as 'div'
  return (
    <Comp
      className={cn(
        'bg-surface border border-border rounded-lg p-4 shadow-[var(--shadow)] text-left',
        hoverable && 'transition-shadow hover:shadow-[var(--shadow-lg)] cursor-pointer',
        className,
      )}
      {...(rest as HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </Comp>
  )
}
