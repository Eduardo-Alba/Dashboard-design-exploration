import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { AlertConfig } from '@/types/domain'

interface AlertsState {
  configs: AlertConfig[]
  isLoading: boolean
  fetchAll: (businessId: string) => Promise<void>
  save: (config: Pick<AlertConfig, 'business_id' | 'type' | 'is_active' | 'threshold' | 'channels'>) => Promise<void>
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  configs: [],
  isLoading: false,

  fetchAll: async (businessId) => {
    set({ isLoading: true })
    const { data } = await supabase.from('alerts_config').select('*').eq('business_id', businessId)
    set({ configs: (data as AlertConfig[]) ?? [], isLoading: false })
  },

  save: async (config) => {
    const { data } = await supabase
      .from('alerts_config')
      .upsert(config, { onConflict: 'business_id,type' })
      .select()
      .single()
    if (data) {
      const updated = data as AlertConfig
      set({ configs: get().configs.map((c) => (c.type === updated.type ? updated : c)) })
    }
  },
}))
