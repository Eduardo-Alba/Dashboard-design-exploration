import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Transaction } from '@/types/domain'

interface TransactionsState {
  transactions: Transaction[]
  isLoading: boolean
  fetchAll: (businessId: string) => Promise<void>
  subscribe: (businessId: string) => () => void
  addOptimistic: (tx: Transaction) => void
}

/**
 * Observer pattern: `subscribe` opens a Supabase Realtime channel. Every INSERT/UPDATE/DELETE
 * on `transactions` for this business pushes into the store, and every component reading via a
 * Zustand selector (Dashboard KPIs, charts, Transacciones list) re-renders automatically.
 */
export const useTransactionsStore = create<TransactionsState>((set) => ({
  transactions: [],
  isLoading: false,

  fetchAll: async (businessId) => {
    set({ isLoading: true })
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', businessId)
      .order('occurred_at', { ascending: false })
    set({ transactions: (data as Transaction[]) ?? [], isLoading: false })
  },

  subscribe: (businessId) => {
    const channel = supabase
      .channel(`business-${businessId}-transactions`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions', filter: `business_id=eq.${businessId}` },
        (payload) => {
          const incoming = payload.new as Transaction
          set((s) => (s.transactions.some((t) => t.id === incoming.id) ? s : { transactions: [incoming, ...s.transactions] }))
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transactions', filter: `business_id=eq.${businessId}` },
        (payload) => {
          const updated = payload.new as Transaction
          set((s) => ({ transactions: s.transactions.map((t) => (t.id === updated.id ? updated : t)) }))
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'transactions', filter: `business_id=eq.${businessId}` },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          set((s) => ({ transactions: s.transactions.filter((t) => t.id !== deletedId) }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },

  // Muestra la transacción de inmediato tras Guardar; si el Realtime ya la insertó primero,
  // el guard de `subscribe` evita el duplicado.
  addOptimistic: (tx) => {
    set((s) => (s.transactions.some((t) => t.id === tx.id) ? s : { transactions: [tx, ...s.transactions] }))
  },
}))
