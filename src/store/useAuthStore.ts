import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Profile } from '@/types/domain'

interface AuthState {
  profile: Profile | null
  status: 'loading' | 'signed-out' | 'signed-in'
  error: string | null
  init: () => () => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data as Profile | null
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  status: 'loading',
  error: null,

  init: () => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) return set({ status: 'signed-out' })
      const profile = await loadProfile(user.id)
      set({ profile, status: profile ? 'signed-in' : 'signed-out' })
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user
      if (!user) return set({ profile: null, status: 'signed-out' })
      const profile = await loadProfile(user.id)
      set({ profile, status: profile ? 'signed-in' : 'signed-out' })
    })

    return () => sub.subscription.unsubscribe()
  },

  signIn: async (email, password) => {
    set({ error: null })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const message = 'No pudimos iniciar sesión. Verifica tu correo y contraseña.'
      set({ error: message })
      return { error: message }
    }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ profile: null, status: 'signed-out' })
  },
}))
