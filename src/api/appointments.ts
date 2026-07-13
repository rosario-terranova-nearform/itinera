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

export const REP_APPOINTMENT_FIELDS =
  'id,company,representative,scheduled_datetime,end_datetime,original_datetime,reference_code,status,notes,created_by,created,updated'

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

async function notifyAdmin(
  appointment: AppointmentRecord,
  type: 'appointment_confirmed' | 'appointment_modified',
  context: {
    repName: string
    oldDatetime?: string
    reason?: string
  },
): Promise<void> {
  if (!appointment.created_by) return

  const company = appointment.expand?.company
  const companyName = company?.name ?? 'Azienda'
  const dateLabel = formatDateTime(appointment.scheduled_datetime)

  const titles: Record<typeof type, string> = {
    appointment_confirmed: `✅ Incarico confermato da ${context.repName}`,
    appointment_modified: `🔄 Data modificata da ${context.repName} – ${companyName}`,
  }

  const messages: Record<typeof type, string> = {
    appointment_confirmed: `Il rappresentante ha confermato l'incarico presso ${companyName} per il ${dateLabel}.`,
    appointment_modified: [
      context.oldDatetime
        ? `Vecchia data: ${formatDateTime(context.oldDatetime)}`
        : '',
      `Nuova data: ${dateLabel}`,
      context.reason ? `Motivo: ${context.reason}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  }

  await createNotification({
    user: appointment.created_by,
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

export async function getByIdForRep(id: string): Promise<AppointmentRecord> {
  return pb.collection('appointments').getOne<AppointmentRecord>(id, {
    expand: DEFAULT_EXPAND,
    fields: REP_APPOINTMENT_FIELDS,
  })
}

export async function getByCompany(companyId: string): Promise<AppointmentRecord[]> {
  return pb.collection('appointments').getFullList<AppointmentRecord>({
    filter: pb.filter('company = {:companyId}', { companyId }),
    sort: '-scheduled_datetime',
    expand: 'representative,created_by',
  })
}

export async function getModifications(
  appointmentId: string,
): Promise<AppointmentModificationRecord[]> {
  return pb.collection('appointment_modifications').getFullList<AppointmentModificationRecord>({
    filter: pb.filter('appointment = {:appointmentId}', { appointmentId }),
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

export async function confirm(
  id: string,
  context: { modifiedBy: string; repName: string },
): Promise<AppointmentRecord> {
  const current = await getByIdForRep(id)

  if (current.status !== 'pending') {
    throw new Error('Solo gli appuntamenti in attesa possono essere confermati.')
  }

  const updated = await pb.collection('appointments').update<AppointmentRecord>(id, {
    status: 'confirmed',
  })

  const expanded = await getByIdForRep(updated.id)
  await notifyAdmin(expanded, 'appointment_confirmed', { repName: context.repName })

  return expanded
}

export async function reschedule(
  id: string,
  data: { scheduled_datetime: string; reason: string },
  context: { modifiedBy: string; repName: string },
): Promise<AppointmentRecord> {
  const current = await getByIdForRep(id)

  if (current.status !== 'pending' && current.status !== 'confirmed') {
    throw new Error('Questo appuntamento non può essere riprogrammato.')
  }

  const oldDatetime = current.scheduled_datetime
  let end_datetime = current.end_datetime

  if (end_datetime) {
    const delta =
      new Date(data.scheduled_datetime).getTime() - new Date(oldDatetime).getTime()
    end_datetime = new Date(new Date(end_datetime).getTime() + delta).toISOString()
  }

  const updated = await pb.collection('appointments').update<AppointmentRecord>(id, {
    scheduled_datetime: data.scheduled_datetime,
    end_datetime,
    status: 'confirmed',
  })

  await logModification({
    appointment: id,
    modified_by: context.modifiedBy,
    old_datetime: oldDatetime,
    new_datetime: data.scheduled_datetime,
    reason: data.reason,
  })

  const expanded = await getByIdForRep(updated.id)
  await notifyAdmin(expanded, 'appointment_modified', {
    repName: context.repName,
    oldDatetime,
    reason: data.reason,
  })

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
  const params: Record<string, string> = {}

  if (options.status) {
    parts.push('status = {:status}')
    params.status = options.status
  }
  if (options.activeOnly) {
    parts.push('status != "cancelled" && status != "completed"')
  }
  if (options.representativeId) {
    parts.push('representative = {:representativeId}')
    params.representativeId = options.representativeId
  }
  if (options.dateFrom) {
    parts.push('scheduled_datetime >= {:dateFrom}')
    params.dateFrom = options.dateFrom
  }
  if (options.dateTo) {
    parts.push('scheduled_datetime <= {:dateTo}')
    params.dateTo = options.dateTo
  }

  return parts.length > 0 ? pb.filter(parts.join(' && '), params) : undefined
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
