import { useState, type FormEvent } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useUIStore } from '@/store/useUIStore'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-4">
      <div className="mb-3 text-sm font-bold text-text">{title}</div>
      {children}
    </Card>
  )
}

export function SettingsPage() {
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const business = useBusinessStore((s) => s.business)
  const isDark = useUIStore((s) => s.isDark)
  const toggleDark = useUIStore((s) => s.toggleDark)
  const showToast = useUIStore((s) => s.showToast)

  const [newPassword, setNewPassword] = useState('')
  const [businessName, setBusinessName] = useState(business?.name ?? '')
  const [rnc, setRnc] = useState(business?.rnc ?? '')

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      showToast('error', 'La contraseña debe tener al menos 6 caracteres.')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    showToast(error ? 'error' : 'success', error ? 'No se pudo actualizar la contraseña.' : 'Contraseña actualizada.')
    if (!error) setNewPassword('')
  }

  async function saveBusiness(e: FormEvent) {
    e.preventDefault()
    if (!business) return
    const { error } = await supabase.from('businesses').update({ name: businessName, rnc: rnc || null }).eq('id', business.id)
    showToast(error ? 'error' : 'success', error ? 'No se pudo guardar.' : 'Negocio actualizado.')
  }

  if (!profile) return null

  return (
    <div className="fz-screen">
      <h1 className="mb-4 text-xl font-extrabold text-text">Configuración</h1>

      <Section title="Perfil">
        <Input label="Nombre" value={profile.full_name} disabled />
        <Input label="Email" value={profile.email} disabled />
        <form onSubmit={changePassword} className="mt-1">
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button type="submit" variant="secondary">
            Cambiar contraseña
          </Button>
        </form>
      </Section>

      {profile.role === 'ADMIN' && (
        <Section title="Mi Negocio">
          <form onSubmit={saveBusiness}>
            <Input label="Nombre comercial" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            <Input label="Rubro" value={business?.rubro ?? ''} disabled />
            <Input label="RNC (opcional)" value={rnc} onChange={(e) => setRnc(e.target.value)} />
            <Button type="submit">Guardar cambios</Button>
          </form>
        </Section>
      )}

      <Section title="Preferencias">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-body">Tema oscuro</span>
            <Toggle checked={isDark} onChange={toggleDark} label="Tema oscuro" />
          </div>
          <div className="flex items-center justify-between text-sec">
            <span>Idioma</span>
            <span>Español</span>
          </div>
          <div className="flex items-center justify-between text-sec">
            <span>Moneda</span>
            <span>{business?.currency ?? 'DOP'}</span>
          </div>
          <div className="flex items-center justify-between text-sec">
            <span>Zona horaria</span>
            <span>América/Santo Domingo</span>
          </div>
        </div>
      </Section>

      <Section title="Seguridad">
        <div className="flex items-center justify-between text-sm text-sec">
          <span>Autenticación de dos factores (2FA)</span>
          <span className="text-xs italic">Próximamente</span>
        </div>
      </Section>

      <Button variant="danger" className="w-full justify-center border border-error/30" onClick={signOut}>
        Cerrar sesión
      </Button>
    </div>
  )
}
