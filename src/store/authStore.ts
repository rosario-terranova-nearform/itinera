import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadProfile: () => Promise<void>
  clearError: () => void
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      set({ isLoading: false, error: error.message })
      return
    }

    set({ session: data.session })

    await get().loadProfile()
  },

  logout: async () => {
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({ session: null, profile: null, isLoading: false, error: null })
  },

  loadProfile: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        set({ profile: null, isLoading: false })
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        set({ error: error.message, isLoading: false })
        return
      }

      if (!profile.is_active) {
        await supabase.auth.signOut()
        set({
          session: null,
          profile: null,
          isLoading: false,
          error: "Account disattivato. Contatta l'amministratore.",
        })
        return
      }

      set({ profile, isLoading: false, error: null })
    } catch {
      set({ isLoading: false, error: 'Errore durante il caricamento del profilo.' })
    }
  },

  clearError: () => set({ error: null }),

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
}))
