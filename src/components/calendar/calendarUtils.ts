import type { EventInput } from '@fullcalendar/core'
import { statusColors } from '@/theme/muiTheme'
import type { AppointmentRecord, AppointmentStatus } from '@/types'
import { getCompanyName, getRepresentativeName } from '@/api/appointments'

export function getStatusColor(status: AppointmentStatus): string {
  return statusColors[status]
}

export function appointmentsToEvents(appointments: AppointmentRecord[]): EventInput[] {
  return appointments.map((appt) => ({
    id: appt.id,
    title: `${getCompanyName(appt)} – ${getRepresentativeName(appt)}`,
    start: appt.scheduled_datetime,
    end: appt.end_datetime || undefined,
    backgroundColor: getStatusColor(appt.status),
    borderColor: getStatusColor(appt.status),
    extendedProps: { appointment: appt },
  }))
}
