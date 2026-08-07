import { useState } from 'react'
import { Toggle } from '@/components/ui/Toggle'
import { Checkbox } from '@/components/ui/Checkbox'
import type { AlertChannel, AlertConfig, AlertType } from '@/types/domain'

const COPY: Record<AlertType, { title: string; description: string; unit?: 'monto' | 'dias' | 'meses' }> = {
  PRESUPUESTO: { title: 'Presupuesto Superado', description: 'Avisar cuando un gasto supere el 90% del límite.' },
  BALANCE: { title: 'Balance Negativo', description: 'Avisar si el saldo baja de RD$', unit: 'monto' },
  MESES_NEG: { title: 'Meses Negativos Consecutivos', description: 'Avisar tras', unit: 'meses' },
  DEUDA: { title: 'Deudas Vencidas', description: 'Recordar', unit: 'dias' },
  INGRESO_BAJO: { title: 'Ingreso Bajo', description: 'Avisar si los ingresos del día son menores a RD$', unit: 'monto' },
}

const CHANNEL_LABELS: Record<AlertChannel, string> = { EMAIL: 'Email', WHATSAPP: 'WhatsApp', IN_APP: 'En la app' }

interface Props {
  config: AlertConfig
  onSave: (patch: Pick<AlertConfig, 'is_active' | 'threshold' | 'channels'>) => void
}

export function AlertRow({ config, onSave }: Props) {
  const copy = COPY[config.type]
  const [threshold, setThreshold] = useState(config.threshold ?? 0)
  const [channels, setChannels] = useState<AlertChannel[]>(config.channels)

  function toggleChannel(ch: AlertChannel) {
    const next = channels.includes(ch) ? channels.filter((c) => c !== ch) : [...channels, ch]
    setChannels(next)
    onSave({ is_active: config.is_active, threshold: config.threshold, channels: next })
  }

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-text">{copy.title}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] text-sec">
            <span>{copy.description}</span>
            {copy.unit && (
              <>
                <input
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  onBlur={() => onSave({ is_active: config.is_active, threshold, channels })}
                  className="w-20 rounded-md border border-border bg-bg px-2 py-1 text-center font-mono text-body"
                />
                {copy.unit === 'dias' && <span>días antes del vencimiento.</span>}
                {copy.unit === 'meses' && <span>meses negativos.</span>}
              </>
            )}
          </div>
        </div>
        <Toggle checked={config.is_active} onChange={(v) => onSave({ is_active: v, threshold, channels })} label={copy.title} />
      </div>
      {config.is_active && (
        <div className="mt-2.5 flex flex-wrap gap-3.5">
          {(Object.keys(CHANNEL_LABELS) as AlertChannel[]).map((ch) => (
            <Checkbox key={ch} checked={channels.includes(ch)} onChange={() => toggleChannel(ch)} label={CHANNEL_LABELS[ch]} />
          ))}
        </div>
      )}
    </div>
  )
}
