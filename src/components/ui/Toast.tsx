import { CheckCircle2, XCircle } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils/cn'

export function ToastViewport() {
  const toasts = useUIStore((s) => s.toasts)
  const dismiss = useUIStore((s) => s.dismissToast)

  return (
    <div className="fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => dismiss(t.id)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-[var(--shadow-lg)] cursor-pointer',
            t.kind === 'success' ? 'bg-pastel text-green-d' : 'bg-error-bg text-error',
          )}
        >
          {t.kind === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {t.message}
        </div>
      ))}
    </div>
  )
}
