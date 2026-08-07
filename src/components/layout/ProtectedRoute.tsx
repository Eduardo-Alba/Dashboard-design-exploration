import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import type { UserRole } from '@/types/domain'

export function ProtectedRoute({ roles, children }: { roles?: UserRole[]; children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const profile = useAuthStore((s) => s.profile)

  if (status === 'loading') return null
  if (status === 'signed-out' || !profile) return <Navigate to="/login" replace />
  if (roles && !roles.includes(profile.role)) return <Navigate to="/transacciones" replace />

  return <>{children}</>
}
