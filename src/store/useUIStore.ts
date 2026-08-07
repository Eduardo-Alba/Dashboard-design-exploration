import { create } from 'zustand'

type ToastKind = 'success' | 'error'
interface Toast {
  id: number
  kind: ToastKind
  message: string
}

interface UIState {
  isDark: boolean
  toggleDark: () => void

  isRegisterModalOpen: boolean
  openRegisterModal: () => void
  closeRegisterModal: () => void

  toasts: Toast[]
  showToast: (kind: ToastKind, message: string) => void
  dismissToast: (id: number) => void
}

const DARK_KEY = 'fz_dark'

function applyTheme(isDark: boolean) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}

const initialDark = typeof window !== 'undefined' && localStorage.getItem(DARK_KEY) === '1'
if (typeof window !== 'undefined') applyTheme(initialDark)

export const useUIStore = create<UIState>((set, get) => ({
  isDark: initialDark,
  toggleDark: () => {
    const next = !get().isDark
    localStorage.setItem(DARK_KEY, next ? '1' : '0')
    applyTheme(next)
    set({ isDark: next })
  },

  isRegisterModalOpen: false,
  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),

  toasts: [],
  showToast: (kind, message) => {
    const id = Date.now() + Math.random()
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }))
    setTimeout(() => get().dismissToast(id), 3000)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
