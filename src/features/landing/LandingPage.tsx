import { Navigate, useNavigate } from 'react-router-dom'
import { BarChart3, Bell, LayoutDashboard, Users, Wallet as LogoIcon } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const FEATURES = [
  { icon: LayoutDashboard, title: 'Dashboard en tiempo real', description: 'Saldo, ganancias y últimos movimientos actualizados al instante.' },
  { icon: Bell, title: 'Alertas inteligentes', description: 'Predeterminadas o personalizadas, con condiciones a tu medida.' },
  { icon: BarChart3, title: 'Reportes PDF y Excel', description: 'Exporta tus finanzas en un clic, listas para compartir.' },
  { icon: Users, title: 'Multi-usuario con roles', description: 'Admin, Cajero y Contador, cada uno con su propio acceso.' },
]

export function LandingPage() {
  const navigate = useNavigate()
  const status = useAuthStore((s) => s.status)
  const role = useAuthStore((s) => s.profile?.role)

  if (status === 'signed-in') return <Navigate to={role === 'CAJERO' ? '/transacciones' : '/dashboard'} replace />

  return (
    <div
      className="min-h-screen"
      style={{ background: 'radial-gradient(1200px 600px at 50% -10%, var(--pastel-soft), var(--bg) 60%)' }}
    >
      <div className="mx-auto flex max-w-[880px] flex-col items-center px-6 py-16 text-center">
        <div className="mb-3.5 flex items-center gap-3">
          <LogoIcon className="text-green" size={40} />
          <span className="text-[40px] font-extrabold leading-none tracking-tight">
            <span className="text-green-d">Finan</span>
            <span className="text-green">Zen</span>
          </span>
        </div>
        <p className="mb-8 max-w-md text-[15px] text-sec">
          Gestión financiera inteligente para micro y pequeños negocios dominicanos.
        </p>

        <div className="mb-14 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Registrarse
          </Button>
        </div>

        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="flex items-start gap-3 text-left">
              <Icon className="mt-0.5 shrink-0 text-teal" size={22} />
              <div>
                <div className="text-sm font-bold text-text">{title}</div>
                <div className="text-[13px] text-sec">{description}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
