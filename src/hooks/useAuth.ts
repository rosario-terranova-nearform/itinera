import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export type UseAuthReturn = ReturnType<typeof useAuthStore.getState>

export function useAuth(): UseAuthReturn {
  const store = useAuthStore()

  useEffect(() => {
    return useAuthStore.getState().init()
  }, [])

  return store
}
