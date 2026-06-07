import { create } from 'zustand'
import pb from '@/lib/pocketbase'
import type { UserRecord } from '@/types'

interface AuthState {
  authModel: UserRecord | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setModel: (model: UserRecord | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  authModel: pb.authStore.model as UserRecord | null,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })

    try {
      const { record } = await pb
        .collection('users')
        .authWithPassword(email, password)

      if (!record.is_active) {
        pb.authStore.clear()
        set({
          authModel: null,
          isLoading: false,
          error: "Account disattivato. Contatta l'amministratore.",
        })
        return
      }

      set({ authModel: record as unknown as UserRecord, isLoading: false, error: null })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Errore durante il login.'
      set({ isLoading: false, error: message })
    }
  },

  logout: async () => {
    pb.authStore.clear()
    set({ authModel: null, isLoading: false, error: null })
  },

  clearError: () => set({ error: null }),

  setModel: (model) => set({ authModel: model }),
}))
