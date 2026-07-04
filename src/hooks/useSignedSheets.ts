import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getByAppointmentId,
  getByRepresentative,
  uploadSignedSheet,
  type SignedSheetUploadInput,
} from '@/api/signedSheets'
import { APPOINTMENTS_QUERY_KEY } from '@/hooks/useAppointments'
import type { SignedSheetRecord } from '@/types'

export const SIGNED_SHEETS_QUERY_KEY = ['signed-sheets'] as const

export function useSignedSheetByAppointmentQuery(appointmentId: string) {
  return useQuery({
    queryKey: [...SIGNED_SHEETS_QUERY_KEY, 'by-appointment', appointmentId],
    queryFn: () => getByAppointmentId(appointmentId),
    enabled: !!appointmentId,
  })
}

export function useRepSignedSheetsQuery(representativeId: string | undefined) {
  return useQuery({
    queryKey: [...SIGNED_SHEETS_QUERY_KEY, 'by-rep', representativeId],
    queryFn: () => getByRepresentative(representativeId!),
    enabled: !!representativeId,
  })
}

export function useUploadSignedSheetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      input,
      onProgress,
    }: {
      input: SignedSheetUploadInput
      onProgress?: (percent: number) => void
    }) => uploadSignedSheet(input, onProgress),
    onSuccess: (record) => {
      void queryClient.invalidateQueries({ queryKey: SIGNED_SHEETS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY })
      void queryClient.invalidateQueries({
        queryKey: [...SIGNED_SHEETS_QUERY_KEY, 'by-appointment', record.appointment],
      })
      void queryClient.invalidateQueries({
        queryKey: [...APPOINTMENTS_QUERY_KEY, 'rep', record.appointment],
      })
      void queryClient.invalidateQueries({
        queryKey: [...APPOINTMENTS_QUERY_KEY, record.appointment],
      })
    },
  })
}

export function getSheetStatusLabel(sheet: SignedSheetRecord): string {
  return sheet.viewed_by_admin ? 'Ricevuto da UC' : 'In elaborazione'
}
