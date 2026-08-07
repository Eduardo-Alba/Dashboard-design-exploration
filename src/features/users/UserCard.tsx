import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/useAuthStore'
import type { Profile, UserRole } from '@/types/domain'

const ROLE_LABELS: Record<UserRole, string> = { ADMIN: 'Administrador', CAJERO: 'Cajero', CONTADOR: 'Contador' }

interface Props {
  user: Profile
  onRoleChange: (role: UserRole) => void
  onToggleActive: (isActive: boolean) => void
}

export function UserCard({ user, onRoleChange, onToggleActive }: Props) {
  const isSelf = useAuthStore((s) => s.profile?.id === user.id)

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <Avatar name={user.full_name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 font-bold text-text">
          {user.full_name} {isSelf && <span className="text-xs font-normal text-sec">(Tú)</span>}
        </div>
        <div className="truncate text-[12.5px] text-sec">{user.email}</div>
      </div>
      <Badge variant={user.role === 'ADMIN' ? 'success' : 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
      <Badge variant={user.is_active ? 'success' : 'neutral'}>{user.is_active ? 'Activo' : 'Inactivo'}</Badge>
      <div className="flex items-center gap-2">
        <Select value={user.role} onChange={(e) => onRoleChange(e.target.value as UserRole)} disabled={isSelf} className="mb-0 w-36">
          <option value="ADMIN">Administrador</option>
          <option value="CAJERO">Cajero</option>
          <option value="CONTADOR">Contador</option>
        </Select>
        <Button variant="outline" disabled={isSelf} className="px-3 py-1.5 text-xs" onClick={() => onToggleActive(!user.is_active)}>
          {user.is_active ? 'Desactivar' : 'Activar'}
        </Button>
      </div>
    </div>
  )
}
