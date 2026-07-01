import { useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { buildCompanyFullAddress, getCompanyName } from '@/api/appointments'
import StatusChip from '@/components/common/StatusChip'
import { statusColors } from '@/theme/muiTheme'
import type { AppointmentRecord } from '@/types'
import { formatDayHeading, formatTimeRange, isSameDay } from '@/utils/dateUtils'

interface DayScheduleTimelineProps {
  date: Date
  appointments: AppointmentRecord[]
  onAppointmentClick?: (appointment: AppointmentRecord) => void
}

export default function DayScheduleTimeline({
  date,
  appointments,
  onAppointmentClick,
}: DayScheduleTimelineProps) {
  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => isSameDay(appointment.scheduled_datetime, date))
        .sort(
          (a, b) =>
            new Date(a.scheduled_datetime).getTime() - new Date(b.scheduled_datetime).getTime(),
        ),
    [appointments, date],
  )

  if (dayAppointments.length === 0) {
    return (
      <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Nessuna visita programmata
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDayHeading(date)} · nessun appuntamento in agenda.
        </Typography>
      </Card>
    )
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        {formatDayHeading(date)}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {dayAppointments.map((appointment) => {
          const company = appointment.expand?.company
          const address = buildCompanyFullAddress(company)
          const isCancelled = appointment.status === 'cancelled'
          const canReschedule =
            appointment.status === 'pending' || appointment.status === 'confirmed'

          return (
            <Card
              key={appointment.id}
              variant="outlined"
              onClick={() => onAppointmentClick?.(appointment)}
              sx={{
                borderLeft: 4,
                borderLeftColor: statusColors[appointment.status],
                borderLeftStyle: appointment.status === 'pending' ? 'dashed' : 'solid',
                cursor: onAppointmentClick ? 'pointer' : 'default',
              }}
            >
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 72 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Orario
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatTimeRange(
                        appointment.scheduled_datetime,
                        appointment.end_datetime || undefined,
                      )}
                    </Typography>
                  </Box>
                  <StatusChip status={appointment.status} />
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    mb: 0.75,
                    textDecoration: isCancelled ? 'line-through' : 'none',
                    color: isCancelled ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {getCompanyName(appointment)}
                </Typography>

                {address ? (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1 }}>
                    <LocationOnOutlinedIcon
                      sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {address}
                    </Typography>
                  </Box>
                ) : null}

                {appointment.notes ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {appointment.notes}
                  </Typography>
                ) : null}

                {canReschedule ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      component={RouterLink}
                      to={`/rep/appointments/${appointment.id}/reschedule`}
                      size="small"
                      variant="outlined"
                      color="inherit"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Modifica orario
                    </Button>
                    <Button
                      component={RouterLink}
                      to={`/rep/appointments/${appointment.id}`}
                      size="small"
                      variant="contained"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Dettaglio
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      component={RouterLink}
                      to={`/rep/appointments/${appointment.id}`}
                      size="small"
                      variant="outlined"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Dettaglio
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </Box>
  )
}
