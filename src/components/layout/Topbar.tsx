import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Moon, Plus, Sun } from 'lucide-react'
import { NAV_ITEMS } from './navConfig'
import { useUIStore } from '@/store/useUIStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useAlerts } from '@/hooks/useAlerts'

const today = new Intl.DateTimeFormat('es-DO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDark = useUIStore((s) => s.isDark)
  const toggleDark = useUIStore((s) => s.toggleDark)
  const openRegisterModal = useUIStore((s) => s.openRegisterModal)
  const role = useAuthStore((s) => s.profile?.role)
  const alerts = useAlerts()

  const title = NAV_ITEMS.find((i) => i.to === location.pathname)?.label ?? 'FinanZen'
  const canRegister = role === 'ADMIN' || role === 'CAJERO'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-bg/85 backdrop-blur-md px-4 md:px-5 py-3.5">
      <div>
        <div className="text-lg font-extrabold tracking-tight text-text">{title}</div>
        <div className="hidden md:block text-[12.5px] text-sec capitalize">{today}</div>
      </div>
      <div className="flex items-center gap-2">
        {canRegister && (
          <button
            type="button"
            onClick={openRegisterModal}
            className="hidden md:flex items-center gap-2 rounded-lg bg-green-strong px-4 py-2.5 text-[13.5px] font-bold text-white cursor-pointer hover:bg-green-strong-hover"
          >
            <Plus size={16} />
            Registrar
          </button>
        )}
        <button
          type="button"
          onClick={toggleDark}
          title="Tema"
          aria-label="Cambiar tema"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text cursor-pointer"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {role === 'ADMIN' && (
          <button
            type="button"
            onClick={() => navigate('/alertas')}
            title="Notificaciones"
            aria-label="Notificaciones"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text cursor-pointer"
          >
            <Bell size={18} />
            {alerts.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
                {alerts.length}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
