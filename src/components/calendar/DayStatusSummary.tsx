import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { AppointmentRecord, AppointmentStatus } from '@/types'
import { statusColors } from '@/theme/muiTheme'
import { isSameDay } from '@/utils/dateUtils'

const STATUS_ITEMS: Array<{ status: AppointmentStatus; label: string }> = [
  { status: 'confirmed', label: 'Confermati' },
  { status: 'pending', label: 'In attesa' },
  { status: 'completed', label: 'Completati' },
  { status: 'cancelled', label: 'Annullati' },
]

interface DayStatusSummaryProps {
  date: Date
  appointments: AppointmentRecord[]
}

export default function DayStatusSummary({ date, appointments }: DayStatusSummaryProps) {
  const dayAppointments = appointments.filter((appointment) =>
    isSameDay(appointment.scheduled_datetime, date),
  )

  const counts = STATUS_ITEMS.map(({ status, label }) => ({
    status,
    label,
    count: dayAppointments.filter((appointment) => appointment.status === status).length,
  }))

  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Riepilogo giornata
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Visite totali
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {dayAppointments.length}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {counts.map(({ status, label, count }) => (
            <Box
              key={status}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: statusColors[status],
                  }}
                />
                <Typography variant="body2">{label}</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
