import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { AccountEntry } from '@/types/domain'

interface AccountsState {
  accounts: AccountEntry[]
  isLoading: boolean
  fetchAll: (businessId: string) => Promise<void>
  subscribe: (businessId: string) => () => void
  markPaid: (id: string) => Promise<void>
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  isLoading: false,

  fetchAll: async (businessId) => {
    set({ isLoading: true })
    const { data } = await supabase.from('receivables_payables').select('*').eq('business_id', businessId).order('due_date')
    set({ accounts: (data as AccountEntry[]) ?? [], isLoading: false })
  },

  subscribe: (businessId) => {
    const channel = supabase
      .channel(`business-${businessId}-accounts`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'receivables_payables', filter: `business_id=eq.${businessId}` },
        () => {
          void supabase
            .from('receivables_payables')
            .select('*')
            .eq('business_id', businessId)
            .order('due_date')
            .then(({ data }) => set({ accounts: (data as AccountEntry[]) ?? [] }))
        },
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  },

  markPaid: async (id) => {
    const previous = get().accounts
    set({ accounts: previous.map((a) => (a.id === id ? { ...a, status: 'PAGADO' } : a)) })
    const { error } = await supabase.from('receivables_payables').update({ status: 'PAGADO' }).eq('id', id)
    if (error) set({ accounts: previous })
  },
}))
