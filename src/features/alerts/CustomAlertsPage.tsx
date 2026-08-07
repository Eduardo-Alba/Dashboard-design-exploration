import { useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuthStore } from '@/store/useAuthStore'
import { useBusinessStore } from '@/store/useBusinessStore'
import { useTransactionsStore } from '@/store/useTransactionsStore'
import { useBudgetsStore } from '@/store/useBudgetsStore'
import { useAccountsStore } from '@/store/useAccountsStore'
import { useCustomAlertsStore } from '@/store/useCustomAlertsStore'
import { useUIStore } from '@/store/useUIStore'
import { CUSTOM_ALERT_MODULE_COMPARATORS, evaluateCustomAlerts } from '@/lib/finance/calculations'
import type { CustomAlertAction, CustomAlertComparator, CustomAlertModule } from '@/types/domain'

const MODULE_META: Record<CustomAlertModule, { label: string; valueLabel: string; suffix: string }> = {
  SALDO: { label: 'Saldo', valueLabel: 'Saldo', suffix: 'RD$' },
  CUENTAS_POR_COBRAR: { label: 'Cuentas por Cobrar', valueLabel: 'Total por Cobrar', suffix: 'RD$' },
  CUENTAS_POR_PAGAR: { label: 'Cuentas por Pagar', valueLabel: 'Total por Pagar', suffix: 'RD$' },
  PRESUPUESTO_CONSUMIDO: { label: 'Presupuesto Consumido', valueLabel: '% Consumido (el más alto del mes)', suffix: '%' },
  INGRESOS_HOY: { label: 'Ingresos de Hoy', valueLabel: 'Ingresos de hoy', suffix: 'RD$' },
}
const MODULES = Object.keys(MODULE_META) as CustomAlertModule[]
const COMPARATOR_LABEL: Record<CustomAlertComparator, string> = { MENOR_QUE: 'Es menor que', MAYOR_QUE: 'Es mayor que' }
const ACTIONS: { value: CustomAlertAction; label: string }[] = [
  { value: 'AVISAR', label: 'Avisar' },
  { value: 'RECORDAR', label: 'Recordar' },
]

export function CustomAlertsPage() {
  const profile = useAuthStore((s) => s.profile)
  const business = useBusinessStore((s) => s.business)
  const transactions = useTransactionsStore((s) => s.transactions)
  const budgets = useBudgetsStore((s) => s.budgets)
  const accounts = useAccountsStore((s) => s.accounts)
  const { alerts, isLoading, fetchAll, create, toggleActive, remove } = useCustomAlertsStore()
  const showToast = useUIStore((s) => s.showToast)

  const [label, setLabel] = useState('')
  const [module, setModule] = useState<CustomAlertModule>('SALDO')
  const [comparator, setComparator] = useState<CustomAlertComparator>('MENOR_QUE')
  const [threshold, setThreshold] = useState('')
  const [action, setAction] = useState<CustomAlertAction>('AVISAR')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  const availableComparators = CUSTOM_ALERT_MODULE_COMPARATORS[module]

  function onModuleChange(m: CustomAlertModule) {
    setModule(m)
    setComparator(CUSTOM_ALERT_MODULE_COMPARATORS[m][0])
  }

  const activeIds = useMemo(() => {
    if (!business) return new Set<string>()
    return new Set(evaluateCustomAlerts(alerts, business, transactions, budgets, accounts).map((a) => a.id))
  }, [alerts, business, transactions, budgets, accounts])

  async function onSubmit() {
    if (!profile || !label.trim() || !threshold) return
    setIsSaving(true)
    await create({
      business_id: profile.business_id,
      label: label.trim(),
      module,
      comparator,
      threshold: Number(threshold),
      action,
    })
    setIsSaving(false)
    setLabel('')
    setThreshold('')
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
            <div className="mb-2 text-[13px] font-semibold text-sec">Condición</div>
            <div className="flex flex-wrap gap-2">
              {availableComparators.map((c) => (
                <Chip key={c} active={comparator === c} onClick={() => setComparator(c)}>
                  {COMPARATOR_LABEL[c]}
                </Chip>
              ))}
            </div>
            {availableComparators.length === 1 && (
              <p className="mt-1.5 text-[12px] text-ph">Este módulo solo tiene sentido con esta condición.</p>
            )}
          </div>

          <Input
            label={`${MODULE_META[module].valueLabel} (${MODULE_META[module].suffix})`}
            type="number"
            placeholder="0.00"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />

          <div>
            <div className="mb-2 text-[13px] font-semibold text-sec">Acción</div>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => (
                <Chip key={a.value} active={action === a.value} onClick={() => setAction(a.value)}>
                  {a.label}
                </Chip>
              ))}
            </div>
          </div>

          <Button onClick={onSubmit} disabled={isSaving || !label.trim() || !threshold}>
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
            {alerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-text">{a.label}</span>
                    {a.is_active && activeIds.has(a.id) && <Badge variant="warning">Activa ahora</Badge>}
                  </div>
                  <div className="text-[12px] text-sec">
                    {MODULE_META[a.module].label} · {COMPARATOR_LABEL[a.comparator]} {MODULE_META[a.module].suffix}
                    {a.threshold} · {a.action === 'AVISAR' ? 'Avisar' : 'Recordar'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
