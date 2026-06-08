import { create } from 'zustand'
import pb from '@/lib/pocketbase'
import type { UserRecord } from '@/types'
import { getLoginErrorMessage } from '@/utils/authErrors'

interface AuthState {
  authModel: UserRecord | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<UserRecord | null>
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
      const { record } = await pb.collection('users').authWithPassword(email, password)
      const user = record as UserRecord

      if (user.is_active === false) {
        pb.authStore.clear()
        set({
          authModel: null,
          isLoading: false,
          error: "Account disattivato. Contatta l'amministratore.",
        })
        return null
      }

      set({ authModel: user, isLoading: false, error: null })
      return user
    } catch (err: unknown) {
      set({ isLoading: false, error: getLoginErrorMessage(err) })
      return null
    }
  },

  logout: async () => {
    pb.authStore.clear()
    set({ authModel: null, isLoading: false, error: null })
  },

  clearError: () => set({ error: null }),

  setModel: (model) => set({ authModel: model }),
}))
