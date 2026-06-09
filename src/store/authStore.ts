import { create } from 'zustand'
import pb from '@/lib/pocketbase'
import type { UserRecord } from '@/types'
import { getLoginErrorMessage } from '@/utils/authErrors'

interface AuthState {
  authModel: UserRecord | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<UserRecord | null>
  logout: () => void
  init: () => () => void
  clearError: () => void
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

  logout: () => {
    pb.authStore.clear()
    set({ authModel: null, isLoading: false, error: null })
  },

  init: () => {
    set({
      authModel: pb.authStore.model as UserRecord | null,
      isLoading: false,
    })

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      set({ authModel: (model as UserRecord) ?? null })
    })

    return unsubscribe
  },

  clearError: () => set({ error: null }),
}))
