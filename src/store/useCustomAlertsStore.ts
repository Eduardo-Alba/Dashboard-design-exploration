import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { CustomAlert } from '@/types/domain'

interface CustomAlertsState {
  alerts: CustomAlert[]
  isLoading: boolean
  fetchAll: (businessId: string) => Promise<void>
  create: (alert: Omit<CustomAlert, 'id' | 'created_at' | 'is_active'>) => Promise<void>
  toggleActive: (id: string, isActive: boolean) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useCustomAlertsStore = create<CustomAlertsState>((set, get) => ({
  alerts: [],
  isLoading: false,

  fetchAll: async (businessId) => {
    set({ isLoading: true })
    const { data } = await supabase
      .from('custom_alerts')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
    set({ alerts: (data as CustomAlert[]) ?? [], isLoading: false })
  },

  create: async (alert) => {
    const { data } = await supabase.from('custom_alerts').insert(alert).select().single()
    if (data) set({ alerts: [data as CustomAlert, ...get().alerts] })
  },

  toggleActive: async (id, isActive) => {
    const { data } = await supabase.from('custom_alerts').update({ is_active: isActive }).eq('id', id).select().single()
    if (data) set({ alerts: get().alerts.map((a) => (a.id === id ? (data as CustomAlert) : a)) })
  },

  remove: async (id) => {
    await supabase.from('custom_alerts').delete().eq('id', id)
    set({ alerts: get().alerts.filter((a) => a.id !== id) })
  },
}))
