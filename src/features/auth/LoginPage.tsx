import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Wallet as LogoIcon } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { setRememberSession } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'

export function LoginPage() {
  const navigate = useNavigate()
  const status = useAuthStore((s) => s.status)
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail] = useState('ali@colmado.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [emailTouched, setEmailTouched] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === 'signed-in') return <Navigate to="/dashboard" replace />

  const emailInvalid = emailTouched && !email.trim()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setEmailTouched(true)
    setSubmitError(null)
    if (!email.trim() || !password) {
      setSubmitError('Completa correo y contraseña para continuar.')
      return
    }
    setIsSubmitting(true)
    setRememberSession(remember)
    const { error } = await signIn(email.trim(), password)
    setIsSubmitting(false)
    if (error) setSubmitError(error)
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'radial-gradient(1200px 600px at 50% -10%, var(--pastel-soft), var(--bg) 60%)' }}
    >
      <div className="w-full max-w-[404px]">
        <div className="mb-6.5 flex flex-col items-center gap-3.5">
          <div className="flex items-center gap-3">
            <LogoIcon className="text-green" size={32} />
            <span className="text-[34px] font-extrabold leading-none tracking-tight">
              <span className="text-green-d">Finan</span>
              <span className="text-green">Zen</span>
            </span>
          </div>
          <div className="text-sm text-sec">Gestión Financiera Inteligente</div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-6.5 shadow-[var(--shadow-lg)]">
          <form onSubmit={onSubmit} noValidate>
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="tu@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              error={emailInvalid ? 'Escribe tu correo para continuar.' : undefined}
            />
            <Input
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="cursor-pointer text-sec"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <div className="mb-5 flex items-center justify-between">
              <Checkbox checked={remember} onChange={setRemember} label="Recuérdame" />
              <a className="cursor-pointer text-[13px] font-semibold text-teal">¿Olvidaste tu contraseña?</a>
            </div>
            {submitError && <div className="mb-4 text-[13px] font-medium text-error">{submitError}</div>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Ingresando…' : 'Iniciar Sesión'}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4.5 w-full text-center text-[13px] font-semibold text-teal cursor-pointer"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
        <div className="mt-4.5 text-center text-xs text-ph">Demo: ali@colmado.com · contraseña de prueba (ver README)</div>
      </div>
    </div>
  )
}
