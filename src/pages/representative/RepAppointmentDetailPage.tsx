import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import VisitInfoCard from '@/components/appointments/VisitInfoCard'
import AppointmentTimeline from '@/components/appointments/AppointmentTimeline'
import StatusChip from '@/components/common/StatusChip'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import {
  useAppointmentModificationsQuery,
  useConfirmAppointmentMutation,
  useRepAppointmentQuery,
} from '@/hooks/useAppointments'
import { getByAppointmentId } from '@/api/signedSheets'
import { getCompanyName } from '@/api/appointments'
import { useAuth } from '@/hooks/useAuth'
import { getDisplayName } from '@/types'

export default function RepAppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { authModel } = useAuth()

  const { data: appointment, isLoading, error: loadError } = useRepAppointmentQuery(id ?? '')
  const { data: modifications = [] } = useAppointmentModificationsQuery(id ?? '')
  const { data: signedSheet } = useQuery({
    queryKey: ['signed-sheets', 'by-appointment', id],
    queryFn: () => getByAppointmentId(id ?? ''),
    enabled: !!id,
  })

  const confirmMutation = useConfirmAppointmentMutation()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    message: string
    severity: 'success' | 'error'
  } | null>(() => {
    const state = location.state as { rescheduled?: boolean } | null
    if (state?.rescheduled) {
      return {
        message: 'Appuntamento riprogrammato. L\'Unità Centrale riceverà una notifica.',
        severity: 'success',
      }
    }
    return null
  })

  useEffect(() => {
    const state = location.state as { rescheduled?: boolean } | null
    if (state?.rescheduled) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const isOwner = appointment?.representative === authModel?.id
  const canConfirm = appointment?.status === 'pending'
  const canReschedule =
    appointment?.status === 'pending' || appointment?.status === 'confirmed'
  const canUpload = appointment?.status === 'confirmed'

  const handleConfirm = async () => {
    if (!appointment || !authModel) return
    try {
      await confirmMutation.mutateAsync({
        id: appointment.id,
        context: {
          modifiedBy: authModel.id,
          repName: getDisplayName(authModel),
        },
      })
      setConfirmOpen(false)
      setSnackbar({ message: 'Visita confermata. L\'Unità Centrale riceverà una notifica.', severity: 'success' })
    } catch {
      setSnackbar({ message: 'Errore nella conferma della visita.', severity: 'error' })
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (loadError || !appointment || !isOwner) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Appuntamento non trovato o non autorizzato.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rep/calendar')}>
          Torna alla pianificazione
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, pb: 12 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Indietro
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {getCompanyName(appointment)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Codice: {appointment.reference_code}
          </Typography>
        </Box>
        <StatusChip status={appointment.status} size="medium" />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
        <VisitInfoCard appointment={appointment} />

        <Card variant="outlined">
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <NotesOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
                Note UC
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.default',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: appointment.notes ? 'normal' : 'italic' }}>
                {appointment.notes || 'Nessuna nota dall\'Unità Centrale.'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Cronologia
            </Typography>
            <AppointmentTimeline
              appointment={appointment}
              modifications={modifications}
              hasSignedSheet={!!signedSheet}
            />
          </CardContent>
        </Card>
      </Box>

      {(canConfirm || canReschedule || canUpload) ? (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 56, md: 0 },
            left: { xs: 0, md: 240 },
            right: 0,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: (theme) => theme.zIndex.appBar - 1,
          }}
        >
          {canUpload ? (
            <Button
              variant="contained"
              fullWidth
              startIcon={<UploadFileOutlinedIcon />}
              onClick={() =>
                navigate(`/rep/documents?appointment_id=${appointment.id}`)
              }
            >
              Carica foglio firma
            </Button>
          ) : null}

          <Box sx={{ display: 'flex', gap: 1 }}>
            {canReschedule ? (
              <Button
                variant="outlined"
                color="inherit"
                fullWidth
                startIcon={<CalendarMonthOutlinedIcon />}
                onClick={() => navigate(`/rep/appointments/${appointment.id}/reschedule`)}
              >
                Modifica data/ora
              </Button>
            ) : null}
            {canConfirm ? (
              <Button
                variant="outlined"
                color="success"
                fullWidth
                startIcon={<CheckCircleIcon />}
                onClick={() => setConfirmOpen(true)}
              >
                Conferma visita
              </Button>
            ) : null}
          </Box>
        </Box>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Confermare la visita?"
        message={`Confermi l'incarico presso ${getCompanyName(appointment)} per la data e ora indicate?`}
        confirmLabel="Conferma visita"
        confirmColor="success"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
        isLoading={confirmMutation.isPending}
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
