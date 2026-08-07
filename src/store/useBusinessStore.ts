import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Business } from '@/types/domain'

interface BusinessState {
  business: Business | null
  fetch: (businessId: string) => Promise<void>
}

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  fetch: async (businessId) => {
    const { data } = await supabase.from('businesses').select('*').eq('id', businessId).single()
    set({ business: data as Business | null })
  },
}))
