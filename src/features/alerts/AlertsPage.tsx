import { useEffect, useMemo, useState } from 'react'
import { Mail, Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { AlertRow } from './AlertRow'
import { CustomAlertFormModal } from './CustomAlertFormModal'
import { MODULE_META, SEVERITY_BADGE, conditionLine } from './customAlertMeta'
import { useAuthStore } from '@/store/useAuthStore'
import { useAlertsStore } from '@/store/useAlertsStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { useCustomAlertsStore } from '@/store/useCustomAlertsStore'
import { useUIStore } from '@/store/useUIStore'
import { evaluateCustomAlerts, type ActiveCustomAlert } from '@/lib/finance/calculations'
import { sendAlertEmail } from '@/lib/sendAlertEmail'
import { useAlerts } from '@/hooks/useAlerts'
import type { AlertConfig } from '@/types/domain'

const ORDER: AlertConfig['type'][] = ['PRESUPUESTO', 'BALANCE', 'MESES_NEG', 'DEUDA', 'INGRESO_BAJO']

export function AlertsPage() {
  const profile = useAuthStore((s) => s.profile)
  const { configs, isLoading, fetchAll, save } = useAlertsStore()
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const budgets = useBudgetsStore((s) => s.budgets)
  const accounts = useAccountsStore((s) => s.accounts)
  const { alerts: customAlerts, isLoading: customLoading, toggleActive, remove, dismiss } = useCustomAlertsStore()
  const { fixed: activeFixed } = useAlerts()
  const showToast = useUIStore((s) => s.showToast)
  const [formOpen, setFormOpen] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  const ordered = ORDER.map((type) => configs.find((c) => c.type === type)).filter((c): c is AlertConfig => !!c)

  const activeById = useMemo(() => {
    if (!business) return new Map<string, ActiveCustomAlert>()
    return new Map(evaluateCustomAlerts(customAlerts, business, transactions, budgets, accounts).map((r) => [r.id, r]))
  }, [business, customAlerts, transactions, budgets, accounts])

  /** Usa una alerta real y actualmente activa como contenido de la prueba (personalizada primero,
   * si no hay ninguna cae a una predeterminada activa, y si tampoco hay usa un mensaje genérico). */
  async function onSendTestEmail() {
    setIsSendingTest(true)
    const activeCustom = customAlerts.find((a) => {
      const active = activeById.get(a.id)
      return a.is_active && !!active && (a.action === 'RECORDAR' || !a.dismissed)
    })
    const sample = activeCustom ? activeById.get(activeCustom.id) : undefined
    const subject = activeCustom ? `FinanZen: ${activeCustom.label}` : activeFixed[0] ? 'FinanZen: Alerta activa' : 'FinanZen: Alerta de prueba'
    const message = (sample?.message ?? activeFixed[0]?.message)
      ? `Esta es una alerta real activa en tu negocio ahora mismo:\n\n${sample?.message ?? activeFixed[0]?.message}`
      : 'No tienes ninguna alerta activa en este momento. Este es un correo de prueba genérico para confirmar que el envío funciona.'
    const ok = await sendAlertEmail(subject, message)
    setIsSendingTest(false)
    showToast(ok ? 'success' : 'error', ok ? 'Correo de prueba enviado' : 'No se pudo enviar el correo de prueba')
  }

  if (isLoading && configs.length === 0) {
    return (
      <div className="fz-screen flex flex-col gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="fz-screen flex flex-col gap-4">
      <h1 className="text-xl font-extrabold text-text">Alertas</h1>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-text">Probar envío de correo</div>
          <div className="text-[12.5px] text-sec">Manda una alerta de prueba a tu correo para confirmar que el módulo funciona.</div>
        </div>
        <Button variant="outline" icon={<Mail size={16} />} disabled={isSendingTest} onClick={onSendTestEmail}>
          {isSendingTest ? 'Enviando…' : 'Enviar alerta de prueba'}
        </Button>
      </Card>

      <div>
        <h2 className="mb-2 text-[15px] font-bold text-text">Alertas predeterminadas</h2>
        <Card>
          {ordered.map((config) => (
            <AlertRow
              key={config.type}
              config={config}
              onSave={async (patch) => {
                if (!profile) return
                await save({ business_id: profile.business_id, type: config.type, ...patch })
                showToast('success', 'Alerta actualizada')
              }}
            />
          ))}
        </Card>
      </div>

      <div>
        <h2 className="mb-2 text-[15px] font-bold text-text">Alertas personalizadas</h2>
        <Card>
          {customLoading && customAlerts.length === 0 ? (
            <Skeleton className="h-24" />
          ) : customAlerts.length === 0 ? (
            <p className="text-sm text-sec">Aún no has creado ninguna.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {customAlerts.map((a) => {
                const active = activeById.get(a.id)
                const showAsActive = a.is_active && !!active && (a.action === 'RECORDAR' || !a.dismissed)
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-text">{a.label}</span>
                        {showAsActive && <Badge variant={SEVERITY_BADGE[a.severity]}>Activa ahora</Badge>}
                      </div>
                      <div className="text-[12px] text-sec">
                        {MODULE_META[a.module].label} · {conditionLine(a)} · {a.action === 'AVISAR' ? 'Avisar' : 'Recordar'}
                      </div>
                      {showAsActive && active && <div className="mt-1 text-[12.5px] text-text">{active.message}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      {showAsActive && a.action === 'AVISAR' && (
                        <button
                          type="button"
                          onClick={() => dismiss(a.id)}
                          aria-label={`Descartar ${a.label}`}
                          title="Descartar"
                          className="rounded-full p-1.5 text-sec hover:bg-bg cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <Toggle checked={a.is_active} onChange={(v) => toggleActive(a.id, v)} label={`Activar ${a.label}`} />
                      <button
                        type="button"
                        onClick={() => remove(a.id)}
                        aria-label={`Eliminar ${a.label}`}
                        className="text-error cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
        <Button variant="secondary" className="mt-3" onClick={() => setFormOpen(true)}>
          + Crear alerta personalizada
        </Button>
      </div>

      <CustomAlertFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
