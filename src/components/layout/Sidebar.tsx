import { NavLink } from 'react-router-dom'
import { LogOut, Wallet as LogoIcon } from 'lucide-react'
import { navForRole } from './navConfig'
import { useAuthStore } from '@/store/useAuthStore'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils/cn'

const ROLE_LABELS = { ADMIN: 'Administrador', CAJERO: 'Cajero', CONTADOR: 'Contador' } as const

export function Sidebar() {
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  if (!profile) return null

  return (
    <aside className="hidden md:flex w-[248px] shrink-0 flex-col border-r border-border bg-surface-2 sticky top-0 h-screen p-3.5">
      <div className="flex items-center gap-2.5 px-2 pb-4.5 pt-1.5">
        <LogoIcon className="text-green" size={26} />
        <span className="text-xl font-extrabold tracking-tight">
          <span className="text-green-d">Finan</span>
          <span className="text-green">Zen</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {navForRole(profile.role).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors',
                isActive ? 'bg-pastel text-green-d' : 'text-body hover:bg-surface',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border pt-3 mt-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar name={profile.full_name} size={36} />
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-text">{profile.full_name}</div>
            <div className="text-[11.5px] text-sec">{ROLE_LABELS[profile.role]}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-[13.5px] font-semibold text-sec cursor-pointer hover:bg-error-bg hover:text-error"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
