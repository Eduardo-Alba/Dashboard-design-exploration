import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/types/domain'

interface UsersState {
  users: Profile[]
  isLoading: boolean
  fetchAll: (businessId: string) => Promise<void>
  toggleActive: (id: string, isActive: boolean) => Promise<void>
  updateRole: (id: string, role: Profile['role']) => Promise<void>
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,

  fetchAll: async (businessId) => {
    set({ isLoading: true })
    const { data } = await supabase.from('profiles').select('*').eq('business_id', businessId).order('full_name')
    set({ users: (data as Profile[]) ?? [], isLoading: false })
  },

  toggleActive: async (id, isActive) => {
    set({ users: get().users.map((u) => (u.id === id ? { ...u, is_active: isActive } : u)) })
    await supabase.from('profiles').update({ is_active: isActive }).eq('id', id)
  },

  updateRole: async (id, role) => {
    set({ users: get().users.map((u) => (u.id === id ? { ...u, role } : u)) })
    await supabase.from('profiles').update({ role }).eq('id', id)
  },
}))
