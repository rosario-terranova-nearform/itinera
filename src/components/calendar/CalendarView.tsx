import { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg } from '@fullcalendar/core'
import itLocale from '@fullcalendar/core/locales/it'
import './calendar.css'
import Box from '@mui/material/Box'
import type { AppointmentRecord } from '@/types'
import { appointmentsToEvents } from './calendarUtils'

interface CalendarViewProps {
  appointments: AppointmentRecord[]
  onEventClick?: (appointment: AppointmentRecord) => void
  height?: string | number
}

export default function CalendarView({
  appointments,
  onEventClick,
  height = 'auto',
}: CalendarViewProps) {
  const events = useMemo(() => appointmentsToEvents(appointments), [appointments])

  const handleEventClick = (info: EventClickArg) => {
    const appointment = info.event.extendedProps.appointment as AppointmentRecord | undefined
    if (appointment && onEventClick) {
      onEventClick(appointment)
    }
  }

  return (
    <Box
      sx={{
        '& .fc': { fontFamily: 'inherit' },
        '& .fc-toolbar-title': { fontSize: '1.1rem', fontWeight: 600 },
        '& .fc-button': {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
        },
        '& .fc-button-primary': {
          bgcolor: 'primary.main',
          borderColor: 'primary.main',
          '&:hover': { bgcolor: 'primary.dark', borderColor: 'primary.dark' },
        },
        '& .fc-event': { cursor: 'pointer', borderRadius: 1 },
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={itLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Oggi',
          month: 'Mese',
          week: 'Settimana',
          day: 'Giorno',
        }}
        height={height}
        events={events}
        eventClick={handleEventClick}
        nowIndicator
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
      />
    </Box>
  )
}
