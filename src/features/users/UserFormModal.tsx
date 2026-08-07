import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useUsersStore } from '@/store/useUsersStore'
import { useUIStore } from '@/store/useUIStore'
import type { UserRole } from '@/types/domain'

export function UserFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profile = useAuthStore((s) => s.profile)
  const fetchAll = useUsersStore((s) => s.fetchAll)
  const showToast = useUIStore((s) => s.showToast)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('CAJERO')
  const [isSaving, setIsSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile || !fullName.trim() || !email.trim()) return
    setIsSaving(true)

    const { data: session } = await supabase.auth.getSession()
    const res = await fetch('/api/invite-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.session?.access_token}` },
      body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), role }),
    })

    setIsSaving(false)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      showToast('error', body.error ?? 'No se pudo crear el usuario.')
      return
    }

    const { tempPassword } = await res.json()
    showToast('success', `Usuario creado. Contraseña temporal: ${tempPassword}`)
    setFullName('')
    setEmail('')
    setRole('CAJERO')
    void fetchAll(profile.business_id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar Usuario">
      <form onSubmit={onSubmit}>
        <Input label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input label="Correo electrónico" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Select label="Rol" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
          <option value="CAJERO">Cajero</option>
          <option value="CONTADOR">Contador</option>
          <option value="ADMIN">Administrador</option>
        </Select>
        <div className="flex flex-col gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Creando…' : 'Agregar Usuario'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
