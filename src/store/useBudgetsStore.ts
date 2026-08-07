import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Budget } from '@/types/domain'

interface BudgetsState {
  budgets: Budget[]
  isLoading: boolean
  fetchAll: (businessId: string) => Promise<void>
  subscribe: (businessId: string) => () => void
}

export const useBudgetsStore = create<BudgetsState>((set) => ({
  budgets: [],
  isLoading: false,

  fetchAll: async (businessId) => {
    set({ isLoading: true })
    const { data } = await supabase.from('budgets').select('*').eq('business_id', businessId).order('category')
    set({ budgets: (data as Budget[]) ?? [], isLoading: false })
  },

  subscribe: (businessId) => {
    const channel = supabase
      .channel(`business-${businessId}-budgets`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `business_id=eq.${businessId}` }, () => {
        // presupuestos cambian poco; re-fetch simple en vez de reconciliar INSERT/UPDATE/DELETE a mano
        void supabase
          .from('budgets')
          .select('*')
          .eq('business_id', businessId)
          .order('category')
          .then(({ data }) => set({ budgets: (data as Budget[]) ?? [] }))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  },
}))
