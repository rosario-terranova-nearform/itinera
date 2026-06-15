import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import ListIcon from '@mui/icons-material/List'
import CalendarView from '@/components/calendar/CalendarView'
import AppointmentDrawer from '@/components/calendar/AppointmentDrawer'
import AppointmentForm, { type AppointmentFormData } from '@/components/appointments/AppointmentForm'
import StatusChip from '@/components/common/StatusChip'
import {
  useAppointmentsQuery,
  useCreateAppointmentMutation,
} from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import type { AppointmentRecord, AppointmentStatus } from '@/types'
import { statusColors } from '@/theme/muiTheme'

const STATUS_SUMMARY: Array<{ status: AppointmentStatus; label: string }> = [
  { status: 'pending', label: 'In attesa' },
  { status: 'confirmed', label: 'Confermati' },
  { status: 'completed', label: 'Completati' },
  { status: 'cancelled', label: 'Annullati' },
]

export default function CalendarPage() {
  const navigate = useNavigate()
  const { authModel } = useAuth()
  const { data: appointments = [], isLoading, error: loadError } = useAppointmentsQuery()
  const createMutation = useCreateAppointmentMutation()

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const statusCounts = STATUS_SUMMARY.map(({ status, label }) => ({
    status,
    label,
    count: appointments.filter((a) => a.status === status).length,
  }))

  const handleEventClick = (appointment: AppointmentRecord) => {
    setSelectedAppointment(appointment)
    setDrawerOpen(true)
  }

  const handleCreate = async (data: AppointmentFormData) => {
    if (!authModel?.id) return
    await createMutation.mutateAsync({
      company: data.companyId,
      representative: data.representativeId,
      scheduled_datetime: data.scheduled_datetime.toISOString(),
      notes: data.notes,
      internal_notes: data.internal_notes,
      created_by: authModel.id,
    })
    setFormOpen(false)
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
            Calendario mensile, settimanale e giornaliero di tutti gli appuntamenti.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ListIcon />}
            onClick={() => navigate('/admin/appointments')}
          >
            Vista elenco
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Crea appuntamento
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {statusCounts.map(({ status, label, count }) => (
          <Card key={status} sx={{ flex: '1 1 140px', minWidth: 120 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <StatusChip status={status} />
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                {count}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {loadError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento del calendario.
        </Alert>
      ) : null}

      <Card variant="outlined" sx={{ p: { xs: 1, md: 2 } }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CalendarView
            appointments={appointments}
            onEventClick={handleEventClick}
            height="calc(100vh - 320px)"
          />
        )}
      </Card>

      <AppointmentDrawer
        appointment={selectedAppointment}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedAppointment(null)
        }}
      />

      <AppointmentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {STATUS_SUMMARY.map(({ status, label }) => (
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
