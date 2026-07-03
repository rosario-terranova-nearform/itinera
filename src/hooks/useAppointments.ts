import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  buildAppointmentsFilter,
  cancel,
  confirm,
  create,
  getAll,
  getByCompany,
  getById,
  getByIdForRep,
  getModifications,
  getUpcomingForRepresentative,
  reschedule,
  update,
  type AppointmentCreateInput,
  type AppointmentUpdateInput,
} from '@/api/appointments'
import type { AppointmentRecord, AppointmentStatus } from '@/types'

export const APPOINTMENTS_QUERY_KEY = ['appointments'] as const

export function useAppointmentsQuery(options?: {
  status?: AppointmentStatus | ''
  representativeId?: string
  dateFrom?: string
  dateTo?: string
}) {
  const filter = options ? buildAppointmentsFilter(options) : undefined

  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, filter ?? 'all'],
    queryFn: () => getAll(filter),
  })
}

export function useRepUpcomingAppointmentsQuery(representativeId: string | undefined) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, 'rep-upcoming', representativeId],
    queryFn: () => getUpcomingForRepresentative(representativeId!),
    enabled: !!representativeId,
  })
}

export function useRepAppointmentQuery(id: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, 'rep', id],
    queryFn: () => getByIdForRep(id),
    enabled: !!id,
  })
}

export function useAppointmentQuery(id: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => getById(id),
    enabled: !!id,
  })
}

export function useCompanyAppointmentsQuery(companyId: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, 'by-company', companyId],
    queryFn: () => getByCompany(companyId),
    enabled: !!companyId,
  })
}

export function useAppointmentModificationsQuery(appointmentId: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, appointmentId, 'modifications'],
    queryFn: () => getModifications(appointmentId),
    enabled: !!appointmentId,
  })
}

export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AppointmentCreateInput) => create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
    },
  })
}

export function useUpdateAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      context,
    }: {
      id: string
      data: AppointmentUpdateInput
      context: {
        current: AppointmentRecord
        modifiedBy: string
        reason?: string
      }
    }) => update(id, data, context),
    onSuccess: (record) => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, record.id] })
    },
  })
}

export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancel(id),
    onSuccess: (record) => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, record.id] })
    },
  })
}

export function useConfirmAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      context,
    }: {
      id: string
      context: { modifiedBy: string; repName: string }
    }) => confirm(id, context),
    onSuccess: (record) => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, record.id] })
      void queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, 'rep', record.id] })
    },
  })
}

export function useRescheduleAppointmentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
      context,
    }: {
      id: string
      data: { scheduled_datetime: string; reason: string }
      context: { modifiedBy: string; repName: string }
    }) => reschedule(id, data, context),
    onSuccess: (record) => {
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, record.id] })
      void queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, 'rep', record.id] })
      void queryClient.invalidateQueries({
        queryKey: [...APPOINTMENTS_QUERY_KEY, record.id, 'modifications'],
      })
    },
  })
}
