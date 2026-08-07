import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { UserCard } from './UserCard'
import { UserFormModal } from './UserFormModal'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useUsersStore } from '@/store/useUsersStore'

export function UsersPage() {
  const profile = useAuthStore((s) => s.profile)
  const { users, isLoading, fetchAll, toggleActive, updateRole } = useUsersStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  if (isLoading && users.length === 0) {
    return (
      <div className="fz-screen flex flex-col gap-3">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    )
  }

  return (
    <div className="fz-screen">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-text">Usuarios</h1>
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Agregar Usuario
        </Button>
      </div>
      <div className="flex flex-col gap-2.5">
        {users.map((u) => (
          <UserCard key={u.id} user={u} onRoleChange={(role) => updateRole(u.id, role)} onToggleActive={(active) => toggleActive(u.id, active)} />
        ))}
      </div>
      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
