import { BarChart3, Bell, CreditCard, LayoutDashboard, ListChecks, Send, Settings, Users, Wallet } from 'lucide-react'
import type { UserRole } from '@/types/domain'

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles: UserRole[]
}

// Regla de negocio #9: CAJERO no ve KPIs globales ni Reportes ni Usuarios; solo Registrar y su
// propio historial de Transacciones. CONTADOR es solo-lectura de reportes (brief §3).
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'CONTADOR'] },
  { to: '/transacciones', label: 'Transacciones', icon: ListChecks, roles: ['ADMIN', 'CAJERO', 'CONTADOR'] },
  { to: '/presupuestos', label: 'Presupuestos', icon: Wallet, roles: ['ADMIN', 'CONTADOR'] },
  { to: '/alertas', label: 'Alertas', icon: Bell, roles: ['ADMIN'] },
  { to: '/cuentas-por-cobrar', label: 'Cuentas por Cobrar', icon: CreditCard, roles: ['ADMIN', 'CONTADOR'] },
  { to: '/cuentas-por-pagar', label: 'Cuentas por Pagar', icon: Send, roles: ['ADMIN', 'CONTADOR'] },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['ADMIN', 'CONTADOR'] },
  { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
  { to: '/configuracion', label: 'Configuración', icon: Settings, roles: ['ADMIN', 'CAJERO', 'CONTADOR'] },
]

export function navForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}
