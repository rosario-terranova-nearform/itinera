import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RescheduleForm, { type RescheduleFormData } from '@/components/appointments/RescheduleForm'
import { getCompanyName } from '@/api/appointments'
import {
  useRepAppointmentQuery,
  useRescheduleAppointmentMutation,
} from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import { getDisplayName } from '@/types'
import { buildScheduledDatetime } from '@/utils/dateUtils'

export default function RescheduleAppointmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { authModel } = useAuth()

  const { data: appointment, isLoading, error: loadError } = useRepAppointmentQuery(id ?? '')
  const rescheduleMutation = useRescheduleAppointmentMutation()
  const [snackbar, setSnackbar] = useState<{
    message: string
    severity: 'success' | 'error'
  } | null>(null)

  const isOwner = appointment?.representative === authModel?.id
  const canReschedule =
    appointment?.status === 'pending' || appointment?.status === 'confirmed'

  const handleSubmit = async (data: RescheduleFormData) => {
    if (!appointment || !authModel) return

    const scheduled_datetime = buildScheduledDatetime(data)

    if (scheduled_datetime === appointment.scheduled_datetime) {
      setSnackbar({
        message: 'Seleziona una data o ora diversa da quella attuale.',
        severity: 'error',
      })
      return
    }

    try {
      await rescheduleMutation.mutateAsync({
        id: appointment.id,
        data: {
          scheduled_datetime,
          reason: data.reason,
        },
        context: {
          modifiedBy: authModel.id,
          repName: getDisplayName(authModel),
        },
      })
      navigate(`/rep/appointments/${appointment.id}`, { state: { rescheduled: true } })
    } catch {
      setSnackbar({ message: 'Errore nella riprogrammazione.', severity: 'error' })
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (loadError || !appointment || !isOwner || !canReschedule) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Appuntamento non trovato o non modificabile.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Indietro
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/rep/appointments/${appointment.id}`)}
        sx={{ mb: 2 }}
      >
        Indietro
      </Button>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Riprogramma visita
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {getCompanyName(appointment)} · {appointment.reference_code}
      </Typography>

      <RescheduleForm
        appointment={appointment}
        onSubmit={handleSubmit}
        isPending={rescheduleMutation.isPending}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}
