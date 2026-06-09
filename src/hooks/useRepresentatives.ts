import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRepresentative,
  getRepresentatives,
  setRepresentativeActive,
  type CreateRepresentativeInput,
} from '@/api/users'

const REPRESENTATIVES_QUERY_KEY = ['representatives'] as const

export function useRepresentativesQuery() {
  return useQuery({
    queryKey: REPRESENTATIVES_QUERY_KEY,
    queryFn: getRepresentatives,
  })
}

export function useCreateRepresentativeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRepresentativeInput) => createRepresentative(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPRESENTATIVES_QUERY_KEY })
    },
  })
}

export function useToggleRepresentativeActiveMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      setRepresentativeActive(id, is_active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPRESENTATIVES_QUERY_KEY })
    },
  })
}
