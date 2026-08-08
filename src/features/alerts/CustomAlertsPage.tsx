import { useEffect, useMemo, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { Checkbox } from '@/components/ui/Checkbox'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { useCustomAlertsStore } from '@/store/useCustomAlertsStore'
import { useUIStore } from '@/store/useUIStore'
import {
  CUSTOM_ALERT_COMPARE_TARGETS,
  CUSTOM_ALERT_MODULE_COMPARATORS,
  CUSTOM_ALERT_MODULE_CONDITION_TYPES,
  CUSTOM_ALERT_MODULE_SUFFIX,
  evaluateCustomAlerts,
} from '@/lib/finance/calculations'
import type {
  AlertChannel,
  CustomAlert,
  CustomAlertAction,
  CustomAlertComparator,
  CustomAlertConditionType,
  CustomAlertModule,
  CustomAlertSeverity,
  CustomAlertVencimientoSentido,
} from '@/types/domain'

const MODULE_META: Record<CustomAlertModule, { label: string; valueLabel: string }> = {
  SALDO: { label: 'Saldo', valueLabel: 'Saldo' },
  CUENTAS_POR_COBRAR: { label: 'Cuentas por Cobrar', valueLabel: 'Total por Cobrar' },
  CUENTAS_POR_PAGAR: { label: 'Cuentas por Pagar', valueLabel: 'Total por Pagar' },
  PRESUPUESTO_CONSUMIDO: { label: 'Presupuesto Consumido', valueLabel: '% Consumido (el más alto del mes)' },
  INGRESOS_HOY: { label: 'Ingresos de Hoy', valueLabel: 'Ingresos de hoy' },
}
const MODULES = Object.keys(MODULE_META) as CustomAlertModule[]
const CONDITION_TYPE_LABEL: Record<CustomAlertConditionType, string> = {
  VALOR_FIJO: 'Valor fijo',
  COMPARAR_MODULO: 'Comparar módulo',
  VENCIMIENTO: 'Vencimiento',
}
const COMPARATOR_LABEL: Record<CustomAlertComparator, string> = { MENOR_QUE: 'Es menor que', MAYOR_QUE: 'Es mayor que' }
const ACTIONS: { value: CustomAlertAction; label: string }[] = [
  { value: 'AVISAR', label: 'Avisar' },
  { value: 'RECORDAR', label: 'Recordar' },
]
const SEVERITIES: { value: CustomAlertSeverity; label: string }[] = [
  { value: 'INFO', label: 'Info' },
  { value: 'ADVERTENCIA', label: 'Advertencia' },
  { value: 'CRITICA', label: 'Crítica' },
]
const SEVERITY_BADGE: Record<CustomAlertSeverity, 'neutral' | 'warning' | 'error'> = {
  INFO: 'neutral',
  ADVERTENCIA: 'warning',
  CRITICA: 'error',
}
const CHANNELS: AlertChannel[] = ['EMAIL', 'WHATSAPP', 'IN_APP']
const CHANNEL_LABELS: Record<AlertChannel, string> = { EMAIL: 'Email', WHATSAPP: 'WhatsApp', IN_APP: 'En la app' }

function conditionLine(a: CustomAlert): string {
  if (a.condition_type === 'VALOR_FIJO') return `${COMPARATOR_LABEL[a.comparator]} ${CUSTOM_ALERT_MODULE_SUFFIX[a.module]}${a.threshold}`
  if (a.condition_type === 'COMPARAR_MODULO') return `${COMPARATOR_LABEL[a.comparator]} ${MODULE_META[a.compare_module!].label}`
  const sentido = a.vencimiento_sentido === 'PROXIMA' ? 'Próxima a vencer en' : 'Atrasada más de'
  return `${sentido} ${a.threshold} día(s)`
}

export function CustomAlertsPage() {
  const profile = useAuthStore((s) => s.profile)
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const budgets = useBudgetsStore((s) => s.budgets)
  const accounts = useAccountsStore((s) => s.accounts)
  const { alerts, isLoading, fetchAll, create, toggleActive, remove, syncTriggerState, dismiss } = useCustomAlertsStore()
  const showToast = useUIStore((s) => s.showToast)

  const [label, setLabel] = useState('')
  const [module, setModule] = useState<CustomAlertModule>('SALDO')
  const [conditionType, setConditionType] = useState<CustomAlertConditionType>('VALOR_FIJO')
  const [comparator, setComparator] = useState<CustomAlertComparator>('MENOR_QUE')
  const [threshold, setThreshold] = useState('')
  const [compareModule, setCompareModule] = useState<CustomAlertModule | null>(null)
  const [vencimientoSentido, setVencimientoSentido] = useState<CustomAlertVencimientoSentido>('ATRASADA')
  const [action, setAction] = useState<CustomAlertAction>('AVISAR')
  const [severity, setSeverity] = useState<CustomAlertSeverity>('ADVERTENCIA')
  const [channels, setChannels] = useState<AlertChannel[]>(['IN_APP'])
  const [customMessage, setCustomMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  function onModuleChange(m: CustomAlertModule) {
    setModule(m)
    const firstConditionType = CUSTOM_ALERT_MODULE_CONDITION_TYPES[m][0]
    setConditionType(firstConditionType)
    setComparator(CUSTOM_ALERT_MODULE_COMPARATORS[m][0])
    setCompareModule(firstConditionType === 'COMPARAR_MODULO' ? CUSTOM_ALERT_COMPARE_TARGETS[m][0] : null)
    setVencimientoSentido('ATRASADA')
  }

  function onConditionTypeChange(ct: CustomAlertConditionType) {
    setConditionType(ct)
    setCompareModule(ct === 'COMPARAR_MODULO' ? CUSTOM_ALERT_COMPARE_TARGETS[module][0] : null)
  }

  function toggleChannel(ch: AlertChannel) {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]))
  }

  const activeResults = useMemo(() => {
    if (!business) return []
    return evaluateCustomAlerts(alerts, business, transactions, budgets, accounts)
  }, [alerts, business, transactions, budgets, accounts])
  const activeById = useMemo(() => new Map(activeResults.map((r) => [r.id, r])), [activeResults])

  // Solo escribe cuando hay una transicion real de disparo (ver useCustomAlertsStore.syncTriggerState) —
  // evita el loop de render que ya se encontro con selectores de Zustand esta misma sesion.
  useEffect(() => {
    void syncTriggerState(new Set(activeById.keys()))
  }, [activeById, syncTriggerState])

  const canSubmit = label.trim() && (conditionType === 'COMPARAR_MODULO' ? !!compareModule : !!threshold)

  async function onSubmit() {
    if (!profile || !canSubmit) return
    setIsSaving(true)
    await create({
      business_id: profile.business_id,
      label: label.trim(),
      module,
      condition_type: conditionType,
      comparator,
      threshold: conditionType === 'COMPARAR_MODULO' ? null : Number(threshold),
      compare_module: conditionType === 'COMPARAR_MODULO' ? compareModule : null,
      vencimiento_sentido: module === 'CUENTAS_POR_PAGAR' && conditionType === 'VENCIMIENTO' ? vencimientoSentido : 'ATRASADA',
      action,
      severity,
      channels,
      custom_message: customMessage.trim() || null,
    })
    setIsSaving(false)
    setLabel('')
    setThreshold('')
    setCustomMessage('')
    showToast('success', 'Alerta creada')
  }

  return (
    <div className="fz-screen flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-extrabold text-text">Alertas personalizadas</h1>
        <p className="text-[13px] text-sec">Módulo experimental — crea tus propias reglas de alerta.</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <Input label="Nombre de la alerta" placeholder="Ej. Saldo crítico" value={label} onChange={(e) => setLabel(e.target.value)} />

          <div>
            <div className="mb-2 text-[13px] font-semibold text-sec">Módulo</div>
            <div className="flex flex-wrap gap-2">
              {MODULES.map((m) => (
                <Chip key={m} active={module === m} onClick={() => onModuleChange(m)}>
                  {MODULE_META[m].label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-sec">Tipo de condición</div>
            <div className="flex flex-wrap gap-2">
              {CUSTOM_ALERT_MODULE_CONDITION_TYPES[module].map((ct) => (
                <Chip key={ct} active={conditionType === ct} onClick={() => onConditionTypeChange(ct)}>
                  {CONDITION_TYPE_LABEL[ct]}
                </Chip>
              ))}
            </div>
            {CUSTOM_ALERT_MODULE_CONDITION_TYPES[module].length === 1 && (
              <p className="mt-1.5 text-[12px] text-ph">Este módulo solo admite Valor fijo.</p>
            )}
          </div>

          {conditionType !== 'VENCIMIENTO' && (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-sec">Condición</div>
              <div className="flex flex-wrap gap-2">
                {(conditionType === 'COMPARAR_MODULO' ? (['MENOR_QUE', 'MAYOR_QUE'] as CustomAlertComparator[]) : CUSTOM_ALERT_MODULE_COMPARATORS[module]).map(
                  (c) => (
                    <Chip key={c} active={comparator === c} onClick={() => setComparator(c)}>
                      {COMPARATOR_LABEL[c]}
                    </Chip>
                  ),
                )}
              </div>
              {conditionType === 'VALOR_FIJO' && CUSTOM_ALERT_MODULE_COMPARATORS[module].length === 1 && (
                <p className="mt-1.5 text-[12px] text-ph">Este módulo solo tiene sentido con esta condición.</p>
              )}
            </div>
          )}

          {conditionType === 'VALOR_FIJO' && (
            <Input
              label={`${MODULE_META[module].valueLabel} (${CUSTOM_ALERT_MODULE_SUFFIX[module]})`}
              type="number"
              placeholder="0.00"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          )}

          {conditionType === 'COMPARAR_MODULO' && (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-sec">Comparar contra</div>
              <div className="flex flex-wrap gap-2">
                {CUSTOM_ALERT_COMPARE_TARGETS[module].map((m) => (
                  <Chip key={m} active={compareModule === m} onClick={() => setCompareModule(m)}>
                    {MODULE_META[m].label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {conditionType === 'VENCIMIENTO' && (
            <>
              {module === 'CUENTAS_POR_PAGAR' && (
                <div>
                  <div className="mb-2 text-[13px] font-semibold text-sec">Sentido</div>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={vencimientoSentido === 'ATRASADA'} onClick={() => setVencimientoSentido('ATRASADA')}>
                      Atrasada
                    </Chip>
                    <Chip active={vencimientoSentido === 'PROXIMA'} onClick={() => setVencimientoSentido('PROXIMA')}>
                      Próxima a vencer
                    </Chip>
                  </div>
                </div>
              )}
              <Input
                label={vencimientoSentido === 'PROXIMA' ? 'Días de anticipación' : 'Días de atraso'}
                type="number"
                placeholder="30"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </>
          )}

          <div>
            <div className="mb-2 text-[13px] font-semibold text-sec">Acción</div>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => (
                <Chip key={a.value} active={action === a.value} onClick={() => setAction(a.value)}>
                  {a.label}
                </Chip>
              ))}
            </div>
            <p className="mt-1.5 text-[12px] text-ph">
              {action === 'AVISAR' ? 'Se muestra una vez y se puede descartar hasta que vuelva a dispararse.' : 'Siempre reaparece mientras la condición sea verdadera.'}
            </p>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-sec">Severidad</div>
            <div className="flex flex-wrap gap-2">
              {SEVERITIES.map((s) => (
                <Chip key={s.value} active={severity === s.value} onClick={() => setSeverity(s.value)}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[13px] font-semibold text-sec">Canales de notificación</div>
            <div className="flex flex-wrap gap-3.5">
              {CHANNELS.map((ch) => (
                <Checkbox key={ch} checked={channels.includes(ch)} onChange={() => toggleChannel(ch)} label={CHANNEL_LABELS[ch]} />
              ))}
            </div>
          </div>

          <div>
            <Input
              label="Mensaje personalizado (opcional)"
              placeholder="Ej. Cuidado, tu saldo bajó"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
            <div className="-mt-2.5 flex flex-wrap items-center gap-2">
              <Chip onClick={() => setCustomMessage((m) => `${m}{valor}`)}>+ Insertar valor calculado</Chip>
              {conditionType === 'COMPARAR_MODULO' && (
                <Chip onClick={() => setCustomMessage((m) => `${m}{valor_comparado}`)}>+ Insertar valor comparado</Chip>
              )}
              <span className="text-[12px] text-ph">Si lo dejas vacío, se genera un mensaje automático.</span>
            </div>
          </div>

          <Button onClick={onSubmit} disabled={isSaving || !canSubmit}>
            {isSaving ? 'Creando…' : 'Crear alerta'}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-[15px] font-bold text-text">Tus alertas</h2>
        {isLoading && alerts.length === 0 ? (
          <Skeleton className="h-24" />
        ) : alerts.length === 0 ? (
          <p className="text-sm text-sec">Aún no has creado ninguna.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {alerts.map((a) => {
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
    </div>
  )
}
