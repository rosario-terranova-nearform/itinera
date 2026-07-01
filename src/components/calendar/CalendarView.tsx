import { useEffect, useMemo, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core'
import itLocale from '@fullcalendar/core/locales/it'
import './calendar.css'
import Box from '@mui/material/Box'
import type { AppointmentRecord } from '@/types'
import { appointmentsToEvents } from './calendarUtils'

export type CalendarViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

interface CalendarViewProps {
  appointments: AppointmentRecord[]
  onEventClick?: (appointment: AppointmentRecord) => void
  height?: string | number
  view?: CalendarViewMode
  currentDate?: Date
  onDateChange?: (date: Date) => void
  showViewSwitcher?: boolean
}

export default function CalendarView({
  appointments,
  onEventClick,
  height = 'auto',
  view = 'dayGridMonth',
  currentDate,
  onDateChange,
  showViewSwitcher = true,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null)
  const events = useMemo(() => appointmentsToEvents(appointments), [appointments])

  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (!api || !currentDate) return
    api.gotoDate(currentDate)
  }, [currentDate])

  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (!api || !view) return
    api.changeView(view)
  }, [view])

  const handleEventClick = (info: EventClickArg) => {
    const appointment = info.event.extendedProps.appointment as AppointmentRecord | undefined
    if (appointment && onEventClick) {
      onEventClick(appointment)
    }
  }

  const handleDatesSet = (info: DatesSetArg) => {
    onDateChange?.(info.view.currentStart)
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
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        locale={itLocale}
        headerToolbar={
          showViewSwitcher
            ? {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }
            : {
                left: 'prev,next today',
                center: 'title',
                right: '',
              }
        }
        buttonText={{
          today: 'Oggi',
          month: 'Mese',
          week: 'Settimana',
          day: 'Giorno',
        }}
        height={height}
        events={events}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        nowIndicator
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
      />
    </Box>
  )
}
