import { useRef, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Wallet } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { formatDOP } from '@/lib/finance/formatters'

/**
 * La firma visual del landing: una miniatura fiel del dashboard real (mismos componentes que
 * KpiGrid/ProgressBar/Badge, no una maqueta inventada), con un tilt 3D que sigue el mouse.
 * Numeros genericos/redondeados a proposito, no los del negocio semilla — para que no lea como
 * una captura de datos reales filtrados.
 */
export function ProductPreviewCard() {
  const reduceMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function onPointerLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 16 })
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 16 })

  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <div className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(circle,var(--wash)_0%,transparent_70%)] blur-2xl" />
      <motion.div
        ref={cardRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        initial={{ opacity: 0, y: 24, rotateX: 0, rotateY: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
        style={{ rotateX: reduceMotion ? 0 : rotateX, rotateY: reduceMotion ? 0 : rotateY, transformStyle: 'preserve-3d' }}
        className="w-full max-w-sm rounded-[20px] border border-border bg-surface-2 p-1.5 shadow-[0_30px_60px_-15px_rgba(27,94,63,.25)]"
      >
        <div className="flex items-center gap-1.5 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-error/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-green/40" />
          <span className="ml-2 text-[11px] font-semibold text-ph">Dashboard</span>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-sec">Saldo Total</span>
            <Wallet size={16} className="text-green-d" />
          </div>
          <div className="mb-5 font-mono text-2xl font-bold text-green-d">{formatDOP(45000)}</div>

          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="font-semibold text-sec">Presupuesto Inventario</span>
            <span className="font-mono text-sec">62%</span>
          </div>
          <ProgressBar pct={62} />

          <div className="mt-4">
            <Badge variant="warning">2 alertas activas</Badge>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
