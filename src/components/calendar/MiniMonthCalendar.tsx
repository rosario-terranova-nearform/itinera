import { useMemo } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import type { AppointmentRecord } from '@/types'

interface MiniMonthCalendarProps {
  value: Dayjs
  onChange: (date: Dayjs) => void
  appointments: AppointmentRecord[]
}

export default function MiniMonthCalendar({
  value,
  onChange,
  appointments,
}: MiniMonthCalendarProps) {
  const appointmentDays = useMemo(() => {
    const days = new Set<string>()
    for (const appointment of appointments) {
      days.add(dayjs(appointment.scheduled_datetime).format('YYYY-MM-DD'))
    }
    return days
  }, [appointments])

  return (
    <DateCalendar
      value={value}
      onChange={(date) => {
        if (date) onChange(date)
      }}
      views={['day']}
      showDaysOutsideCurrentMonth
      fixedWeekNumber={6}
      slotProps={{
        day: (ownerState) => {
          const dayKey = ownerState.day.format('YYYY-MM-DD')
          const isCurrentMonth = ownerState.day.month() === value.month()
          const hasAppointments = isCurrentMonth && appointmentDays.has(dayKey)

          return {
            sx: hasAppointments
              ? {
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  },
                }
              : undefined,
          }
        },
      }}
      sx={{
        width: '100%',
        maxWidth: 320,
        '& .MuiPickersCalendarHeader-label': {
          fontWeight: 600,
        },
      }}
    />
  )
}
