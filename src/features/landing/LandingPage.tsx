import { Navigate, useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Wallet as LogoIcon } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/Button'
import { FloatingOrbs } from './FloatingOrbs'

const FEATURES = [
  { number: '01', title: 'Dashboard en tiempo real', description: 'Saldo, ganancias y últimos movimientos actualizados al instante.' },
  { number: '02', title: 'Alertas inteligentes', description: 'Predeterminadas o personalizadas, con condiciones a tu medida.' },
  { number: '03', title: 'Reportes PDF y Excel', description: 'Exporta tus finanzas en un clic, listas para compartir.' },
  { number: '04', title: 'Multi-usuario con roles', description: 'Admin, Cajero y Contador, cada uno con su propio acceso.' },
]

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
} satisfies Variants
const heroItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
} satisfies Variants

export function LandingPage() {
  const navigate = useNavigate()
  const status = useAuthStore((s) => s.status)
  const role = useAuthStore((s) => s.profile?.role)

  if (status === 'signed-in') return <Navigate to={role === 'CAJERO' ? '/transacciones' : '/dashboard'} replace />

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <LogoIcon className="text-green" size={24} />
            <span className="text-lg font-extrabold tracking-tight">
              <span className="text-green-d">Finan</span>
              <span className="text-green">Zen</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/login')} className="text-[13.5px] font-semibold text-sec cursor-pointer hover:text-text">
              Iniciar Sesión
            </button>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <FloatingOrbs />
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-[880px] flex-col items-center px-6 py-24 text-center md:py-32"
        >
          <motion.p variants={heroItem} className="mb-5 text-[13px] font-bold uppercase tracking-[0.2em] text-teal">
            Gestión Financiera Inteligente
          </motion.p>
          <motion.h1 variants={heroItem} className="mb-6 text-5xl font-extrabold leading-[0.95] tracking-tight text-text md:text-7xl">
            Tu negocio,
            <br />
            en números claros.
          </motion.h1>
          <motion.p variants={heroItem} className="mb-10 max-w-md text-[15px] text-sec">
            La plataforma financiera para micro y pequeños negocios dominicanos — dashboard, alertas y reportes en un solo lugar.
          </motion.p>
          <motion.div variants={heroItem} className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
            <Button variant="outline" onClick={() => navigate('/login')}>
              Registrarse
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-[720px] px-6 py-20">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`flex items-baseline gap-6 py-7 ${i > 0 ? 'border-t border-border' : ''}`}
          >
            <span className="font-mono text-sm font-semibold text-ph">{f.number}</span>
            <div>
              <div className="text-lg font-bold text-text">{f.title}</div>
              <div className="mt-1 text-[14px] text-sec">{f.description}</div>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="border-t border-border py-20 text-center">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-text md:text-3xl">Empieza a organizar tus finanzas hoy.</h2>
        <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
      </section>
    </div>
  )
}
