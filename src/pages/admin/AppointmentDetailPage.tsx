import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import CancelIcon from '@mui/icons-material/Cancel'
import DescriptionIcon from '@mui/icons-material/Description'
import AppointmentForm, { type AppointmentFormData } from '@/components/appointments/AppointmentForm'
import AppointmentTimeline from '@/components/appointments/AppointmentTimeline'
import StatusChip from '@/components/common/StatusChip'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import SignedSheetPreview from '@/components/documents/SignedSheetPreview'
import {
  useAppointmentQuery,
  useAppointmentModificationsQuery,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
} from '@/hooks/useAppointments'
import {
  getAdminSheetStatusLabel,
  useSignedSheetByAppointmentQuery,
} from '@/hooks/useSignedSheets'
import { getCompanyName, getRepresentativeName } from '@/api/appointments'
import { useAuth } from '@/hooks/useAuth'
import { getDisplayName } from '@/types'
import { formatDateTime } from '@/utils/dateUtils'
import { notify } from '@/utils/toast'

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { authModel } = useAuth()

  const { data: appointment, isLoading, error: loadError } = useAppointmentQuery(id ?? '')
  const { data: modifications = [] } = useAppointmentModificationsQuery(id ?? '')
  const { data: signedSheet, refetch: refetchSignedSheet } = useSignedSheetByAppointmentQuery(id ?? '')

  const updateMutation = useUpdateAppointmentMutation()
  const cancelMutation = useCancelAppointmentMutation()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  const canEdit =
    appointment &&
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed'
  const canCancel = canEdit

  const handleEdit = async (data: AppointmentFormData) => {
    if (!appointment || !authModel?.id) return
    try {
      await updateMutation.mutateAsync({
        id: appointment.id,
        data: {
          company: data.companyId,
          representative: data.representativeId,
          scheduled_datetime: data.scheduled_datetime.toISOString(),
          notes: data.notes,
          internal_notes: data.internal_notes,
        },
        context: {
          current: appointment,
          modifiedBy: authModel.id,
        },
      })
      setEditOpen(false)
      notify.success('Appuntamento aggiornato. Il rappresentante riceverà una notifica.')
    } catch {
      notify.error('Errore nell\'aggiornamento dell\'appuntamento.')
    }
  }

  const handleCancel = async () => {
    if (!appointment) return
    try {
      await cancelMutation.mutateAsync(appointment.id)
      setConfirmCancel(false)
      notify.success('Appuntamento annullato. Il rappresentante riceverà una notifica.')
    } catch {
      notify.error('Errore nell\'annullamento dell\'appuntamento.')
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={280} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    )
  }

  if (loadError || !appointment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento dell&apos;appuntamento.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/appointments')}>
          Torna agli appuntamenti
        </Button>
      </Box>
    )
  }

  const company = appointment.expand?.company

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/calendar')}
        sx={{ mb: 2 }}
      >
        Torna alla pianificazione
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" color="text.secondary">
            {appointment.reference_code}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {getCompanyName(appointment)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
            <StatusChip status={appointment.status} size="medium" />
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(appointment.scheduled_datetime)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {canEdit ? (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
              Modifica
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setConfirmCancel(true)}
            >
              Annulla
            </Button>
          ) : null}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Informazioni visita
            </Typography>
            <InfoRow label="Azienda" value={getCompanyName(appointment)} />
            <InfoRow
              label="Indirizzo"
              value={
                company
                  ? [company.address, company.city, company.province, company.postal_code]
                      .filter(Boolean)
                      .join(', ')
                  : '—'
              }
            />
            <InfoRow label="Rappresentante" value={getRepresentativeName(appointment)} />
            <InfoRow label="Data e ora" value={formatDateTime(appointment.scheduled_datetime)} />
            <InfoRow
              label="Creato da"
              value={
                appointment.expand?.created_by
                  ? getDisplayName(appointment.expand.created_by)
                  : '—'
              }
            />
            <Divider sx={{ my: 2 }} />
            <InfoRow label="Note" value={appointment.notes || '—'} />
            <InfoRow label="Note interne UC" value={appointment.internal_notes || '—'} />
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Storico eventi
            </Typography>
            <AppointmentTimeline
              appointment={appointment}
              modifications={modifications}
              hasSignedSheet={!!signedSheet}
            />
          </CardContent>
        </Card>
      </Box>

      {(appointment.status === 'completed' || signedSheet) && (
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Foglio firma
              </Typography>
            </Box>
            {signedSheet ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <InfoRow
                  label="Stato lettura UC"
                  value={getAdminSheetStatusLabel(signedSheet)}
                />
                <InfoRow
                  label="Caricato il"
                  value={formatDateTime(signedSheet.created)}
                />
                <SignedSheetPreview
                  sheet={signedSheet}
                  trackView
                  onViewed={() => void refetchSignedSheet()}
                />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Visita completata. Il foglio firma sarà disponibile dopo il caricamento da parte del
                rappresentante.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <AppointmentForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        initialData={appointment}
        title="Modifica appuntamento"
        isPending={updateMutation.isPending}
      />

      <ConfirmDialog
        open={confirmCancel}
        title="Annullare l'appuntamento?"
        message={`L'incarico presso ${getCompanyName(appointment)} del ${formatDateTime(appointment.scheduled_datetime)} verrà annullato. Il rappresentante riceverà una notifica.`}
        confirmLabel="Annulla appuntamento"
        confirmColor="error"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
        isLoading={cancelMutation.isPending}
      />
    </Box>
  )
}
