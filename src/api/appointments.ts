import pb from '@/lib/pocketbase'
import { createNotification } from '@/api/notifications'
import type {
  AppointmentModificationRecord,
  AppointmentRecord,
  AppointmentStatus,
  CompanyRecord,
} from '@/types'
import { getDisplayName } from '@/types'
import { formatDateTime } from '@/utils/dateUtils'
import { generateReferenceCode } from '@/utils/referenceCode'

const DEFAULT_EXPAND = 'company,representative,created_by'

export type AppointmentCreateInput = {
  company: string
  representative: string
  scheduled_datetime: string
  end_datetime?: string
  notes?: string
  internal_notes?: string
  created_by: string
}

export type AppointmentUpdateInput = {
  company?: string
  representative?: string
  scheduled_datetime?: string
  end_datetime?: string
  notes?: string
  internal_notes?: string
  status?: AppointmentStatus
}

export type AppointmentModificationInput = {
  appointment: string
  modified_by: string
  old_datetime: string
  new_datetime: string
  reason: string
}

async function notifyRepresentative(
  appointment: AppointmentRecord,
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled',
): Promise<void> {
  const company = appointment.expand?.company
  const companyName = company?.name ?? 'Azienda'
  const dateLabel = formatDateTime(appointment.scheduled_datetime)
  const address = buildCompanyFullAddress(company)

  const titles: Record<typeof type, string> = {
    appointment_created: `📅 Nuovo incarico – ${companyName} il ${dateLabel}`,
    appointment_updated: `✏️ Incarico modificato – ${companyName}`,
    appointment_cancelled: `❌ Incarico annullato – ${companyName} del ${dateLabel}`,
  }

  const messages: Record<typeof type, string> = {
    appointment_created: [
      `Ti è stato assegnato un nuovo incarico.`,
      `Data: ${dateLabel}`,
      `Azienda: ${companyName}`,
      address ? `Indirizzo: ${address}` : '',
      appointment.notes ? `Note: ${appointment.notes}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    appointment_updated: `L'incarico presso ${companyName} è stato modificato. Nuova data: ${dateLabel}.`,
    appointment_cancelled: `L'incarico presso ${companyName} del ${dateLabel} è stato annullato.`,
  }

  await createNotification({
    user: appointment.representative,
    appointment: appointment.id,
    type,
    title: titles[type],
    message: messages[type],
  })
}

export async function getAll(
  filter?: string,
  sort = '-scheduled_datetime',
): Promise<AppointmentRecord[]> {
  return pb.collection('appointments').getFullList<AppointmentRecord>({
    sort,
    filter: filter || undefined,
    expand: DEFAULT_EXPAND,
  })
}

export async function getUpcomingForRepresentative(
  representativeId: string,
): Promise<AppointmentRecord[]> {
  const filter = buildAppointmentsFilter({
    representativeId,
    dateFrom: new Date().toISOString(),
    activeOnly: true,
  })

  return getAll(filter, 'scheduled_datetime')
}

export async function getById(
  id: string,
  expand: string = DEFAULT_EXPAND,
): Promise<AppointmentRecord> {
  return pb.collection('appointments').getOne<AppointmentRecord>(id, { expand })
}

export async function getByCompany(companyId: string): Promise<AppointmentRecord[]> {
  return pb.collection('appointments').getFullList<AppointmentRecord>({
    filter: `company = "${companyId}"`,
    sort: '-scheduled_datetime',
    expand: 'representative,created_by',
  })
}

export async function getModifications(
  appointmentId: string,
): Promise<AppointmentModificationRecord[]> {
  return pb.collection('appointment_modifications').getFullList<AppointmentModificationRecord>({
    filter: `appointment = "${appointmentId}"`,
    sort: 'created',
    expand: 'modified_by',
  })
}

export async function logModification(
  data: AppointmentModificationInput,
): Promise<AppointmentModificationRecord> {
  return pb.collection('appointment_modifications').create<AppointmentModificationRecord>(data)
}

export async function create(data: AppointmentCreateInput): Promise<AppointmentRecord> {
  const scheduledDatetime = data.scheduled_datetime

  const record = await pb.collection('appointments').create<AppointmentRecord>({
    company: data.company,
    representative: data.representative,
    scheduled_datetime: scheduledDatetime,
    end_datetime: data.end_datetime ?? '',
    original_datetime: scheduledDatetime,
    reference_code: '',
    status: 'pending',
    notes: data.notes ?? '',
    internal_notes: data.internal_notes ?? '',
    created_by: data.created_by,
  })

  const withCode = await pb.collection('appointments').update<AppointmentRecord>(record.id, {
    reference_code: generateReferenceCode(record.id),
  })

  const expanded = await getById(withCode.id)
  await notifyRepresentative(expanded, 'appointment_created')

  return expanded
}

export async function update(
  id: string,
  data: AppointmentUpdateInput,
  context: {
    current: AppointmentRecord
    modifiedBy: string
    reason?: string
  },
): Promise<AppointmentRecord> {
  const { current, modifiedBy, reason = 'Modifica da Unità Centrale' } = context
  const payload: AppointmentUpdateInput = { ...data }

  if (current.status === 'confirmed') {
    payload.status = 'pending'
  } else if (current.status === 'pending') {
    payload.status = 'pending'
  }

  const datetimeChanged =
    data.scheduled_datetime !== undefined &&
    data.scheduled_datetime !== current.scheduled_datetime

  const updated = await pb.collection('appointments').update<AppointmentRecord>(id, payload)
  const expanded = await getById(updated.id)

  if (datetimeChanged && data.scheduled_datetime) {
    await logModification({
      appointment: id,
      modified_by: modifiedBy,
      old_datetime: current.scheduled_datetime,
      new_datetime: data.scheduled_datetime,
      reason,
    })
  }

  if (current.status !== 'cancelled' && current.status !== 'completed') {
    await notifyRepresentative(expanded, 'appointment_updated')
  }

  return expanded
}

export async function cancel(id: string): Promise<AppointmentRecord> {
  const current = await getById(id)

  if (current.status === 'cancelled' || current.status === 'completed') {
    return current
  }

  const updated = await pb.collection('appointments').update<AppointmentRecord>(id, {
    status: 'cancelled',
  })

  const expanded = await getById(updated.id)
  await notifyRepresentative(expanded, 'appointment_cancelled')

  return expanded
}

export function buildAppointmentsFilter(options: {
  status?: AppointmentStatus | ''
  representativeId?: string
  dateFrom?: string
  dateTo?: string
  activeOnly?: boolean
}): string | undefined {
  const parts: string[] = []

  if (options.status) {
    parts.push(`status = "${options.status}"`)
  }
  if (options.activeOnly) {
    parts.push('status != "cancelled" && status != "completed"')
  }
  if (options.representativeId) {
    parts.push(`representative = "${options.representativeId}"`)
  }
  if (options.dateFrom) {
    parts.push(`scheduled_datetime >= "${options.dateFrom}"`)
  }
  if (options.dateTo) {
    parts.push(`scheduled_datetime <= "${options.dateTo}"`)
  }

  return parts.length > 0 ? parts.join(' && ') : undefined
}

export function buildCompanyFullAddress(company?: CompanyRecord): string {
  if (!company) return ''
  return [company.address, company.city, company.province].filter(Boolean).join(', ')
}

export function buildMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function getRepresentativeName(appointment: AppointmentRecord): string {
  return appointment.expand?.representative
    ? getDisplayName(appointment.expand.representative)
    : '—'
}

export function getCompanyName(appointment: AppointmentRecord): string {
  return appointment.expand?.company?.name ?? '—'
}
