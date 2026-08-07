import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className, id, children, ...rest }: SelectProps) {
  const selectId = id ?? rest.name
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-[13px] font-semibold text-body">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-[9px] border bg-bg px-3.5 py-3 text-sm text-body outline-none transition-shadow',
          'focus:border-green focus:ring-2 focus:ring-green/25',
          error ? 'border-error' : 'border-border',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {error && <div className="mt-1.5 text-[12.5px] text-error">{error}</div>}
    </div>
  )
}
