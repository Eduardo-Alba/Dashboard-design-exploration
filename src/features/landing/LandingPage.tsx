import { Navigate, useNavigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { BarChart3, Bell, LayoutDashboard, Users, Wallet as LogoIcon } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/Button'
import { ProductPreviewCard } from './ProductPreviewCard'

const STEPS = [
  { number: '01', title: 'Regístrate', description: 'Crea tu cuenta y configura tu negocio en minutos.' },
  { number: '02', title: 'Registra tus movimientos', description: 'Ingresos y gastos, categorizados, desde cualquier dispositivo.' },
  { number: '03', title: 'Recibe alertas y reportes', description: 'FinanZen avisa lo importante y arma tus reportes solo.' },
]

const FEATURES = [
  { icon: LayoutDashboard, title: 'Dashboard en tiempo real', description: 'Saldo, ganancias y últimos movimientos actualizados al instante.' },
  { icon: Bell, title: 'Alertas inteligentes', description: 'Predeterminadas o personalizadas, con condiciones a tu medida.' },
  { icon: BarChart3, title: 'Reportes PDF y Excel', description: 'Exporta tus finanzas en un clic, listas para compartir.' },
  { icon: Users, title: 'Multi-usuario con roles', description: 'Admin, Cajero y Contador, cada uno con su propio acceso.' },
]

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
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
          <button type="button" onClick={() => navigate('/login')} className="text-[13.5px] font-semibold text-sec cursor-pointer hover:text-text">
            Iniciar Sesión
          </button>
        </div>
      </header>

      <section
        className="mx-auto grid max-w-[1080px] grid-cols-1 items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28"
        style={{ background: 'radial-gradient(1200px 600px at 50% -10%, var(--wash), var(--bg) 60%)' }}
      >
        <motion.div variants={heroContainer} initial="hidden" animate="show">
          <motion.p variants={heroItem} className="mb-5 text-[13px] font-bold uppercase tracking-[0.2em] text-teal">
            Gestión Financiera Inteligente
          </motion.p>
          <motion.h1 variants={heroItem} className="font-display mb-6 text-5xl leading-[1] font-semibold tracking-tight text-text md:text-6xl">
            Tu negocio,
            <br />
            en números claros.
          </motion.h1>
          <motion.p variants={heroItem} className="mb-10 max-w-md text-[15px] text-sec">
            La plataforma financiera para micro y pequeños negocios dominicanos — dashboard, alertas y reportes en un solo lugar.
          </motion.p>
          <motion.div variants={heroItem} className="flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Registrarse
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="flex justify-center md:justify-end">
          <ProductPreviewCard />
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="mx-auto max-w-[720px] px-6">
        <h2 className="font-display mb-10 text-2xl font-semibold text-text">Cómo funciona</h2>
        {STEPS.map((s, i) => (
          <motion.div
            key={s.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`flex items-baseline gap-6 py-7 ${i > 0 ? 'border-t border-border' : ''}`}
          >
            <span className="font-mono text-sm font-semibold text-ph">{s.number}</span>
            <div>
              <div className="text-lg font-bold text-text">{s.title}</div>
              <div className="mt-1 text-[14px] text-sec">{s.description}</div>
            </div>
          </motion.div>
        ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1080px] px-6">
          <h2 className="font-display mb-10 text-2xl font-semibold text-text">Todo lo que necesitas</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                className="flex items-start gap-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wash text-green-d">
                  <Icon size={19} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-text">{title}</div>
                  <div className="mt-0.5 text-[13.5px] text-sec">{description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-wash py-20 text-center">
        <h2 className="font-display mb-5 text-2xl font-semibold tracking-tight text-text md:text-3xl">Empieza a organizar tus finanzas hoy.</h2>
        <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
      </section>

      <footer className="border-t border-border bg-surface px-6 py-8">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoIcon className="text-green" size={16} />
            <span className="text-sm font-bold text-text">FinanZen</span>
          </div>
          <span className="text-xs text-ph">© 2026 FinanZen</span>
        </div>
      </footer>
    </div>
  )
}
