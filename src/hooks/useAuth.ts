import { useEffect } from 'react'
import pb from '@/lib/pocketbase'
import { useAuthStore } from '@/store/authStore'
import type { UserRecord } from '@/types'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    const model = pb.authStore.model as UserRecord | null
    useAuthStore.getState().setModel(model)
    useAuthStore.setState({ isLoading: false })

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      useAuthStore.getState().setModel(model as UserRecord | null)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return store
}
