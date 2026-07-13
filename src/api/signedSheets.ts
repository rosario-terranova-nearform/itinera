import pb from '@/lib/pocketbase'
import { createNotification } from '@/api/notifications'
import { getById } from '@/api/appointments'
import type { AppointmentRecord, SignedSheetRecord } from '@/types'
import { formatDateTime } from '@/utils/dateUtils'
import { ACCEPTED_SIGNED_SHEET_TYPES, MAX_SIGNED_SHEET_BYTES } from '@/utils/signedSheetUpload'

export type SignedSheetUploadInput = {
  file: File
  appointmentId: string
  uploadedBy: string
  repName: string
  notes?: string
}

function isAcceptedMimeType(type: string): boolean {
  return type in ACCEPTED_SIGNED_SHEET_TYPES
}

async function notifySignedSheetUploaded(
  appointment: AppointmentRecord,
  repName: string,
): Promise<void> {
  if (!appointment.created_by) return

  const companyName = appointment.expand?.company?.name ?? 'Azienda'
  const dateLabel = formatDateTime(appointment.scheduled_datetime)

  await createNotification({
    user: appointment.created_by,
    appointment: appointment.id,
    type: 'signed_sheet_uploaded',
    title: `📎 Foglio firma ricevuto – ${companyName} del ${dateLabel}`,
    message: `${repName} ha caricato il foglio firma per la visita presso ${companyName} del ${dateLabel}.`,
  })
}

function createSignedSheetWithProgress(
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<SignedSheetRecord> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const url = `${pb.baseUrl}/api/collections/signed_sheets/records`

    xhr.open('POST', url)
    if (pb.authStore.token) {
      xhr.setRequestHeader('Authorization', pb.authStore.token)
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as SignedSheetRecord)
        } catch {
          reject(new Error('Risposta del server non valida.'))
        }
        return
      }

      try {
        const body = JSON.parse(xhr.responseText) as { message?: string }
        reject(new Error(body.message ?? 'Errore nel caricamento del file.'))
      } catch {
        reject(new Error('Errore nel caricamento del file.'))
      }
    }

    xhr.onerror = () => reject(new Error('Errore di rete durante il caricamento.'))
    xhr.send(formData)
  })
}

export async function getByAppointmentId(appointmentId: string): Promise<SignedSheetRecord | null> {
  try {
    return await pb.collection('signed_sheets').getFirstListItem<SignedSheetRecord>(
      pb.filter('appointment = {:appointmentId}', { appointmentId }),
    )
  } catch {
    return null
  }
}

export type SignedSheetsFilter = {
  viewed?: boolean
  representativeId?: string
  search?: string
}

export async function getAll(filter?: SignedSheetsFilter): Promise<SignedSheetRecord[]> {
  const parts: string[] = []
  const params: Record<string, string | boolean> = {}

  if (filter?.viewed === true) {
    parts.push('viewed_by_admin = {:viewed}')
    params.viewed = true
  } else if (filter?.viewed === false) {
    parts.push('viewed_by_admin = {:viewed}')
    params.viewed = false
  }

  if (filter?.representativeId) {
    parts.push('uploaded_by = {:representativeId}')
    params.representativeId = filter.representativeId
  }

  if (filter?.search?.trim()) {
    parts.push('file_name ~ {:search}')
    params.search = filter.search.trim()
  }

  return pb.collection('signed_sheets').getFullList<SignedSheetRecord>({
    filter: parts.length > 0 ? pb.filter(parts.join(' && '), params) : undefined,
    sort: '-created',
    expand: 'appointment,uploaded_by,appointment.company',
  })
}

export async function getByRepresentative(representativeId: string): Promise<SignedSheetRecord[]> {
  return pb.collection('signed_sheets').getFullList<SignedSheetRecord>({
    filter: pb.filter('uploaded_by = {:representativeId}', { representativeId }),
    sort: '-created',
    expand: 'appointment,appointment.company',
  })
}

export async function uploadSignedSheet(
  input: SignedSheetUploadInput,
  onProgress?: (percent: number) => void,
): Promise<SignedSheetRecord> {
  if (!isAcceptedMimeType(input.file.type)) {
    throw new Error('Formato file non supportato.')
  }
  if (input.file.size > MAX_SIGNED_SHEET_BYTES) {
    throw new Error('Il file supera la dimensione massima di 10 MB.')
  }

  const appointment = await getById(input.appointmentId)

  if (appointment.representative !== input.uploadedBy) {
    throw new Error('Non autorizzato a caricare documenti per questo appuntamento.')
  }
  if (appointment.status !== 'confirmed') {
    throw new Error('Il foglio firma può essere caricato solo per visite confermate.')
  }

  const existing = await getByAppointmentId(input.appointmentId)
  if (existing) {
    throw new Error('Esiste già un foglio firma per questo appuntamento.')
  }

  const formData = new FormData()
  formData.append('file', input.file)
  formData.append('file_name', input.file.name)
  formData.append('file_size', String(input.file.size))
  formData.append('mime_type', input.file.type)
  formData.append('appointment', input.appointmentId)
  formData.append('uploaded_by', input.uploadedBy)
  if (input.notes) {
    formData.append('notes', input.notes)
  }

  const sheet = await createSignedSheetWithProgress(formData, onProgress)

  await pb.collection('appointments').update(input.appointmentId, {
    status: 'completed',
  })

  await notifySignedSheetUploaded(appointment, input.repName)

  return sheet
}

export async function getFileUrl(record: SignedSheetRecord): Promise<string> {
  const token = await pb.files.getToken()
  return pb.files.getUrl(record, record.file, { token })
}

export async function markAsViewed(id: string): Promise<SignedSheetRecord> {
  return pb.collection('signed_sheets').update<SignedSheetRecord>(id, {
    viewed_by_admin: true,
    viewed_at: new Date().toISOString(),
  })
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}
