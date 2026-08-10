import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Chip } from '@/components/ui/Chip'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { useAuthStore } from '@/store/useAuthStore'
import { useCustomAlertsStore } from '@/store/useCustomAlertsStore'
import { useUIStore } from '@/store/useUIStore'
import {
  CUSTOM_ALERT_COMPARE_TARGETS,
  CUSTOM_ALERT_MODULE_COMPARATORS,
  CUSTOM_ALERT_MODULE_CONDITION_TYPES,
  CUSTOM_ALERT_MODULE_SUFFIX,
} from '@/lib/finance/calculations'
import { MODULE_META, COMPARATOR_LABEL } from './customAlertMeta'
import type {
  AlertChannel,
  CustomAlertAction,
  CustomAlertComparator,
  CustomAlertConditionType,
  CustomAlertModule,
  CustomAlertSeverity,
  CustomAlertVencimientoSentido,
} from '@/types/domain'

const MODULES = Object.keys(MODULE_META) as CustomAlertModule[]
const CONDITION_TYPE_LABEL: Record<CustomAlertConditionType, string> = {
  VALOR_FIJO: 'Valor fijo',
  COMPARAR_MODULO: 'Comparar módulo',
  VENCIMIENTO: 'Vencimiento',
}
const ACTIONS: { value: CustomAlertAction; label: string }[] = [
  { value: 'AVISAR', label: 'Avisar' },
  { value: 'RECORDAR', label: 'Recordar' },
]
const SEVERITIES: { value: CustomAlertSeverity; label: string }[] = [
  { value: 'INFO', label: 'Info' },
  { value: 'ADVERTENCIA', label: 'Advertencia' },
  { value: 'CRITICA', label: 'Crítica' },
]
const CHANNELS: AlertChannel[] = ['EMAIL', 'WHATSAPP', 'IN_APP']
const CHANNEL_LABELS: Record<AlertChannel, string> = { EMAIL: 'Email', WHATSAPP: 'WhatsApp', IN_APP: 'En la app' }

export function CustomAlertFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const profile = useAuthStore((s) => s.profile)
  const create = useCustomAlertsStore((s) => s.create)
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

  function resetForm() {
    setLabel('')
    setModule('SALDO')
    setConditionType('VALOR_FIJO')
    setComparator('MENOR_QUE')
    setThreshold('')
    setCompareModule(null)
    setVencimientoSentido('ATRASADA')
    setAction('AVISAR')
    setSeverity('ADVERTENCIA')
    setChannels(['IN_APP'])
    setCustomMessage('')
  }

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
    resetForm()
    showToast('success', 'Alerta creada')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Crear alerta personalizada">
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
    </Modal>
  )
}
