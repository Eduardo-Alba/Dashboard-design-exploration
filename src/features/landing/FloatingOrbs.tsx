import { useRef, type PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

interface Orb {
  className: string
  gradient: string
  depth: number
  floatDuration: number
  floatDistance: [number, number]
}

const ORBS: Orb[] = [
  { className: 'left-[8%] top-[12%] h-72 w-72', gradient: 'radial-gradient(circle, var(--green) 0%, transparent 70%)', depth: 30, floatDuration: 11, floatDistance: [0, -28] },
  { className: 'right-[10%] top-[6%] h-56 w-56', gradient: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)', depth: 50, floatDuration: 9, floatDistance: [0, 22] },
  { className: 'left-[30%] bottom-[4%] h-64 w-64', gradient: 'radial-gradient(circle, var(--pastel) 0%, transparent 70%)', depth: 20, floatDuration: 14, floatDistance: [0, -18] },
  { className: 'right-[22%] bottom-[14%] h-40 w-40', gradient: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)', depth: 65, floatDuration: 10, floatDistance: [0, 16] },
]

/** Fondo decorativo del hero: orbes con gradiente de marca, flotando + parallax al mouse. */
export function FloatingOrbs() {
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <div ref={containerRef} onPointerMove={onPointerMove} className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <FloatingOrb key={i} orb={orb} mouseX={mouseX} mouseY={mouseY} reduceMotion={!!reduceMotion} />
      ))}
    </div>
  )
}

function FloatingOrb({
  orb,
  mouseX,
  mouseY,
  reduceMotion,
}: {
  orb: Orb
  mouseX: ReturnType<typeof useMotionValue<number>>
  mouseY: ReturnType<typeof useMotionValue<number>>
  reduceMotion: boolean
}) {
  // Dos capas: la de afuera lleva el parallax (style.x/y desde un motion value), la de adentro
  // el loop de flotacion (animate.y con keyframes) — no pueden compartir la misma propiedad
  // "y" en un solo elemento, Framer Motion no las combina.
  const parallaxX = useSpring(useTransform(mouseX, (v) => v * orb.depth), { stiffness: 60, damping: 20 })
  const parallaxY = useSpring(useTransform(mouseY, (v) => v * orb.depth), { stiffness: 60, damping: 20 })

  return (
    <motion.div
      className={`absolute ${orb.className}`}
      style={{ x: reduceMotion ? 0 : parallaxX, y: reduceMotion ? 0 : parallaxY }}
    >
      <motion.div
        className="h-full w-full rounded-full opacity-40 blur-3xl"
        style={{ background: orb.gradient }}
        animate={reduceMotion ? undefined : { y: orb.floatDistance }}
        transition={reduceMotion ? undefined : { duration: orb.floatDuration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
    </motion.div>
  )
}
