import { useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { AlertRow } from './AlertRow'
import { useAuthStore } from '@/store/useAuthStore'
import { useAlertsStore } from '@/store/useAlertsStore'
import { useUIStore } from '@/store/useUIStore'
import type { AlertConfig } from '@/types/domain'

const ORDER: AlertConfig['type'][] = ['PRESUPUESTO', 'BALANCE', 'MESES_NEG', 'DEUDA', 'INGRESO_BAJO']

export function AlertsPage() {
  const profile = useAuthStore((s) => s.profile)
  const { configs, isLoading, fetchAll, save } = useAlertsStore()
  const showToast = useUIStore((s) => s.showToast)

  useEffect(() => {
    if (profile) void fetchAll(profile.business_id)
  }, [profile, fetchAll])

  const ordered = ORDER.map((type) => configs.find((c) => c.type === type)).filter((c): c is AlertConfig => !!c)

  if (isLoading && configs.length === 0) {
    return (
      <div className="fz-screen flex flex-col gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="fz-screen">
      <h1 className="mb-4 text-xl font-extrabold text-text">Alertas</h1>
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
  )
}
