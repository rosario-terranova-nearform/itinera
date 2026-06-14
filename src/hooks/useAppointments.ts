import { useQuery } from '@tanstack/react-query'
import { getByCompany } from '@/api/appointments'

export const APPOINTMENTS_QUERY_KEY = ['appointments'] as const

export function useCompanyAppointmentsQuery(companyId: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, 'by-company', companyId],
    queryFn: () => getByCompany(companyId),
    enabled: !!companyId,
  })
}
