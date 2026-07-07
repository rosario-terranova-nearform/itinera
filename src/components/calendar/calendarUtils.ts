import type { EventInput } from '@fullcalendar/core'
import { statusColors } from '@/theme/muiTheme'
import type { AppointmentRecord, AppointmentStatus } from '@/types'
import { getCompanyName, getRepresentativeName } from '@/api/appointments'

export function getStatusColor(status: AppointmentStatus): string {
  return statusColors[status]
}

export function isAppointmentDraggable(status: AppointmentStatus): boolean {
  return status !== 'cancelled' && status !== 'completed'
}

export function shiftEndDatetime(
  oldStart: string,
  newStart: string,
  endDatetime?: string,
): string | undefined {
  if (!endDatetime) return undefined
  const delta = new Date(newStart).getTime() - new Date(oldStart).getTime()
  return new Date(new Date(endDatetime).getTime() + delta).toISOString()
}

export function appointmentsToEvents(
  appointments: AppointmentRecord[],
  options?: { editable?: boolean },
): EventInput[] {
  const editable = options?.editable ?? false

  return appointments.map((appt) => ({
    id: appt.id,
    title: `${getCompanyName(appt)} – ${getRepresentativeName(appt)}`,
    start: appt.scheduled_datetime,
    end: appt.end_datetime || undefined,
    backgroundColor: getStatusColor(appt.status),
    borderColor: getStatusColor(appt.status),
    editable: editable && isAppointmentDraggable(appt.status),
    extendedProps: { appointment: appt },
  }))
}
