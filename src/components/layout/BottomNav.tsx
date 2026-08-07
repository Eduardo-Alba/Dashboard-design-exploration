import { NavLink } from 'react-router-dom'
import { BarChart3, Home, ListChecks, Plus, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils/cn'

export function BottomNav() {
  const role = useAuthStore((s) => s.profile?.role)
  const openRegisterModal = useUIStore((s) => s.openRegisterModal)
  const canSeeReportes = role === 'ADMIN' || role === 'CONTADOR'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn('flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold', isActive ? 'text-green' : 'text-sec')

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-border bg-surface-2/95 backdrop-blur-sm px-2 pb-[env(safe-area-inset-bottom)]">
      <NavLink to="/dashboard" className={linkClass}>
        <Home size={22} />
        Inicio
      </NavLink>
      <NavLink to="/transacciones" className={linkClass}>
        <ListChecks size={22} />
        Movim.
      </NavLink>
      <button
        type="button"
        onClick={openRegisterModal}
        aria-label="Registrar transacción"
        className="flex flex-1 items-center justify-center cursor-pointer"
      >
        <span className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-green-strong text-white shadow-[0_4px_14px_rgba(90,155,111,.45)]">
          <Plus size={26} />
        </span>
      </button>
      {canSeeReportes ? (
        <NavLink to="/reportes" className={linkClass}>
          <BarChart3 size={22} />
          Reportes
        </NavLink>
      ) : (
        <span className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold text-ph/40">
          <BarChart3 size={22} />
          Reportes
        </span>
      )}
      <NavLink to="/configuracion" className={linkClass}>
        <Settings size={22} />
        Más
      </NavLink>
    </nav>
  )
}
