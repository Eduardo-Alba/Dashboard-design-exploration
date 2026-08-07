import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Revisa tu archivo .env.local.')
}

// "Recuérdame" desmarcado -> el token de sesión va a sessionStorage (se borra al cerrar el
// navegador) en vez de localStorage (persiste), relevante en un cajero compartido.
const REMEMBER_KEY = 'finanzen-remember'
function activeStorage(): Storage {
  return localStorage.getItem(REMEMBER_KEY) === '0' ? sessionStorage : localStorage
}
export function setRememberSession(remember: boolean) {
  if (remember) localStorage.removeItem(REMEMBER_KEY)
  else localStorage.setItem(REMEMBER_KEY, '0')
}

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: {
      getItem: (key) => activeStorage().getItem(key),
      setItem: (key, value) => activeStorage().setItem(key, value),
      removeItem: (key) => activeStorage().removeItem(key),
    },
  },
})
