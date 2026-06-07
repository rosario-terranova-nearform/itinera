import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setSession(session)
      if (session) {
        useAuthStore.getState().loadProfile()
      } else {
        useAuthStore.setState({ isLoading: false })
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session)
      if (session) {
        useAuthStore.getState().loadProfile()
      } else {
        useAuthStore.getState().setProfile(null)
        useAuthStore.setState({ isLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return store
}
