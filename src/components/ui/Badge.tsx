import { cn } from '@/lib/utils/cn'

type Variant = 'success' | 'warning' | 'error' | 'neutral'

const variantClasses: Record<Variant, string> = {
  success: 'bg-pastel text-green-d',
  warning: 'bg-warn-bg text-warn',
  error: 'bg-error-bg text-error',
  neutral: 'bg-border/50 text-sec',
}

export function Badge({ variant = 'neutral', children }: { variant?: Variant; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', variantClasses[variant])}>
      {children}
    </span>
  )
}
