import { useMemo, useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CalendarView, { type CalendarViewMode } from '@/components/calendar/CalendarView'
import MiniMonthCalendar from '@/components/calendar/MiniMonthCalendar'
import DayStatusSummary from '@/components/calendar/DayStatusSummary'
import DayScheduleTimeline from '@/components/calendar/DayScheduleTimeline'
import AppointmentDrawer from '@/components/calendar/AppointmentDrawer'
import { useAppointmentsQuery } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import type { AppointmentRecord, AppointmentStatus } from '@/types'
import { statusColors } from '@/theme/muiTheme'

type ScheduleView = 'day' | 'week' | 'month'

const STATUS_LEGEND: Array<{ status: AppointmentStatus; label: string }> = [
  { status: 'pending', label: 'In attesa' },
  { status: 'confirmed', label: 'Confermati' },
  { status: 'completed', label: 'Completati' },
  { status: 'cancelled', label: 'Annullati' },
]

function toCalendarView(view: ScheduleView): CalendarViewMode {
  if (view === 'week') return 'timeGridWeek'
  return 'dayGridMonth'
}

export default function RepCalendarPage() {
  const { authModel } = useAuth()
  const { data: appointments = [], isLoading, error } = useAppointmentsQuery({
    representativeId: authModel?.id,
  })

  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs())
  const [view, setView] = useState<ScheduleView>('day')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const selectedDateValue = useMemo(() => selectedDate.toDate(), [selectedDate])

  const handleAppointmentClick = (appointment: AppointmentRecord) => {
    setSelectedAppointment(appointment)
    setDrawerOpen(true)
  }

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, nextView: ScheduleView | null) => {
    if (nextView) setView(nextView)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Pianificazione
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestisci le visite in programma e la tua agenda.
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          aria-label="Vista calendario"
        >
          <ToggleButton value="day">Giorno</ToggleButton>
          <ToggleButton value="week">Settimana</ToggleButton>
          <ToggleButton value="month">Mese</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento del calendario.
        </Alert>
      ) : null}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card variant="outlined" sx={{ overflow: 'hidden' }}>
              <MiniMonthCalendar
                value={selectedDate}
                onChange={setSelectedDate}
                appointments={appointments}
              />
            </Card>
            <DayStatusSummary date={selectedDateValue} appointments={appointments} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            {view === 'day' ? (
              <DayScheduleTimeline
                date={selectedDateValue}
                appointments={appointments}
                onAppointmentClick={handleAppointmentClick}
              />
            ) : (
              <Card variant="outlined" sx={{ p: { xs: 1, md: 2 } }}>
                <CalendarView
                  appointments={appointments}
                  view={toCalendarView(view)}
                  currentDate={selectedDateValue}
                  onDateChange={(date) => setSelectedDate(dayjs(date))}
                  onEventClick={handleAppointmentClick}
                  showViewSwitcher={false}
                  height="calc(100vh - 280px)"
                />
              </Card>
            )}
          </Box>
        </Box>
      )}

      <AppointmentDrawer
        appointment={selectedAppointment}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedAppointment(null)
        }}
        detailPathPrefix="/rep/appointments"
      />

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {STATUS_LEGEND.map(({ status, label }) => (
          <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: statusColors[status],
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
