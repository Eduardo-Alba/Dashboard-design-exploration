import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  prefix?: ReactNode
  suffix?: ReactNode
}

export function Input({ label, error, prefix, suffix, className, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[13px] font-semibold text-body">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-sec text-sm">{prefix}</span>}
        <input
          id={inputId}
          className={cn(
            'w-full rounded-[9px] border bg-bg px-3.5 py-3 text-sm text-body outline-none transition-shadow',
            'focus:border-green focus:ring-2 focus:ring-green/25',
            error ? 'border-error' : 'border-border',
            Boolean(prefix) && 'pl-9',
            Boolean(suffix) && 'pr-9',
            className,
          )}
          {...rest}
        />
        {suffix && <span className="absolute right-3 text-sec">{suffix}</span>}
      </div>
      {error && <div className="mt-1.5 text-[12.5px] text-error">{error}</div>}
    </div>
  )
}
