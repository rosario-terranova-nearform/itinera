import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAll,
  getById,
  create,
  update,
  softDelete,
  type CompanyCreateInput,
  type CompanyUpdateInput,
} from '@/api/companies'

const COMPANIES_QUERY_KEY = ['companies'] as const

export function useCompaniesQuery(filter?: string) {
  return useQuery({
    queryKey: [...COMPANIES_QUERY_KEY, filter],
    queryFn: () => getAll(filter),
  })
}

export function useCompanyQuery(id: string) {
  return useQuery({
    queryKey: [...COMPANIES_QUERY_KEY, id],
    queryFn: () => getById(id),
    enabled: !!id,
  })
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompanyCreateInput) => create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
    },
  })
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyUpdateInput }) => update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
    },
  })
}

export function useSoftDeleteCompanyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => softDelete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY })
    },
  })
}
