import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
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

// Unico negocio demo sembrado — ver supabase/migrations/0011 (RLS prof_self_insert).
const DEMO_BUSINESS_ID = '11111111-1111-1111-1111-111111111111'

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data as Profile | null
}

/**
 * Usuarios nuevos via OAuth (Google) no tienen fila en profiles todavia. Se auto-inscriben en
 * el negocio demo como CAJERO — la RLS (prof_self_insert) solo permite exactamente esta forma.
 * El error de duplicado (carrera entre getSession() y onAuthStateChange) se ignora a proposito.
 */
async function loadOrProvisionProfile(user: User): Promise<Profile | null> {
  const existing = await loadProfile(user.id)
  if (existing) return existing
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Usuario'
  await supabase.from('profiles').insert({
    id: user.id,
    business_id: DEMO_BUSINESS_ID,
    full_name: fullName,
    email: user.email,
    role: 'CAJERO',
    is_active: true,
  })
  return loadProfile(user.id)
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  status: 'loading',
  error: null,

  init: () => {
    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user
      if (!user) return set({ status: 'signed-out' })
      const profile = await loadOrProvisionProfile(user)
      set({ profile, status: profile ? 'signed-in' : 'signed-out' })
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user
      if (!user) return set({ profile: null, status: 'signed-out' })
      const profile = await loadOrProvisionProfile(user)
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
