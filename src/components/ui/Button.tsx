import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-green-strong text-white shadow-[0_4px_14px_rgba(90,155,111,.35)] hover:bg-green-strong-hover',
  secondary: 'bg-teal-strong text-white hover:bg-teal-strong-hover',
  outline: 'bg-transparent border-2 border-green text-green hover:bg-pastel',
  ghost: 'bg-transparent text-sec hover:bg-surface',
  danger: 'bg-transparent text-sec hover:bg-error-bg hover:text-error',
}

export function Button({ variant = 'primary', icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold cursor-pointer transition-colors',
        'disabled:cursor-not-allowed disabled:bg-border disabled:text-ph disabled:shadow-none',
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
