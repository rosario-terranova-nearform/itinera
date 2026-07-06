import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAll,
  getByAppointmentId,
  getByRepresentative,
  markAsViewed,
  uploadSignedSheet,
  type SignedSheetsFilter,
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

export function useAllSignedSheetsQuery(filter?: SignedSheetsFilter) {
  return useQuery({
    queryKey: [...SIGNED_SHEETS_QUERY_KEY, 'all', filter],
    queryFn: () => getAll(filter),
  })
}

export function useUnreadSignedSheetsMapQuery() {
  return useQuery({
    queryKey: [...SIGNED_SHEETS_QUERY_KEY, 'unread-map'],
    queryFn: async () => {
      const sheets = await getAll({ viewed: false })
      return new Map(sheets.map((sheet) => [sheet.appointment, sheet]))
    },
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

export function useMarkAsViewedMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markAsViewed(id),
    onSuccess: (record) => {
      void queryClient.invalidateQueries({ queryKey: SIGNED_SHEETS_QUERY_KEY })
      void queryClient.invalidateQueries({
        queryKey: [...SIGNED_SHEETS_QUERY_KEY, 'by-appointment', record.appointment],
      })
    },
  })
}

export function getRepSheetStatusLabel(sheet: SignedSheetRecord): string {
  return sheet.viewed_by_admin ? 'Ricevuto da UC' : 'In elaborazione'
}

export function getAdminSheetStatusLabel(sheet: SignedSheetRecord): string {
  return sheet.viewed_by_admin ? 'Visualizzato' : 'Non letto'
}

export function getRepSheetStatusColor(
  sheet: SignedSheetRecord,
): 'success' | 'warning' {
  return sheet.viewed_by_admin ? 'success' : 'warning'
}

export function getAdminSheetStatusColor(
  sheet: SignedSheetRecord,
): 'success' | 'warning' {
  return sheet.viewed_by_admin ? 'success' : 'warning'
}

export function summarizeRepSheets(sheets: SignedSheetRecord[]) {
  const inProgress = sheets.filter((sheet) => !sheet.viewed_by_admin).length
  const received = sheets.filter((sheet) => sheet.viewed_by_admin).length
  return { total: sheets.length, inProgress, received }
}

export function summarizeAdminSheets(sheets: SignedSheetRecord[]) {
  const unread = sheets.filter((sheet) => !sheet.viewed_by_admin).length
  const viewed = sheets.filter((sheet) => sheet.viewed_by_admin).length
  return { total: sheets.length, unread, viewed }
}

/** @deprecated Use getRepSheetStatusLabel */
export const getSheetStatusLabel = getRepSheetStatusLabel
