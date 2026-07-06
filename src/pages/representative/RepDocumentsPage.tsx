import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FileUploadZone from '@/components/common/FileUploadZone'
import DocumentListItem from '@/components/documents/DocumentListItem'
import DocumentStatusSummary from '@/components/documents/DocumentStatusSummary'
import { getCompanyName } from '@/api/appointments'
import { useAppointmentsQuery } from '@/hooks/useAppointments'
import {
  summarizeRepSheets,
  useRepSignedSheetsQuery,
  useSignedSheetByAppointmentQuery,
  useUploadSignedSheetMutation,
} from '@/hooks/useSignedSheets'
import { useAuth } from '@/hooks/useAuth'
import { getDisplayName } from '@/types'
import { formatDateTime } from '@/utils/dateUtils'

export default function RepDocumentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { authModel } = useAuth()

  const preselectedId = searchParams.get('appointment_id') ?? ''
  const selectedAppointmentId = preselectedId

  const { data: confirmedAppointments = [], isLoading: appointmentsLoading } =
    useAppointmentsQuery({
      representativeId: authModel?.id,
      status: 'confirmed',
    })

  const { data: uploadedSheets = [], isLoading: sheetsLoading } = useRepSignedSheetsQuery(
    authModel?.id,
  )

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{
    message: string
    severity: 'success' | 'error'
  } | null>(null)

  const uploadMutation = useUploadSignedSheetMutation()

  const appointmentsWithSheet = useMemo(
    () => new Set(uploadedSheets.map((sheet) => sheet.appointment)),
    [uploadedSheets],
  )

  const uploadableAppointments = useMemo(
    () => confirmedAppointments.filter((appointment) => !appointmentsWithSheet.has(appointment.id)),
    [appointmentsWithSheet, confirmedAppointments],
  )

  const selectedAppointment = useMemo(
    () => confirmedAppointments.find((appointment) => appointment.id === selectedAppointmentId),
    [confirmedAppointments, selectedAppointmentId],
  )

  const { data: existingSheet } = useSignedSheetByAppointmentQuery(selectedAppointmentId)

  const canUpload =
    !!selectedAppointment &&
    selectedAppointment.status === 'confirmed' &&
    !existingSheet &&
    !appointmentsWithSheet.has(selectedAppointment.id)

  const handleAppointmentChange = (appointmentId: string) => {
    setSelectedFile(null)
    setUploadError(null)
    setNotes('')

    if (appointmentId) {
      setSearchParams({ appointment_id: appointmentId })
    } else {
      setSearchParams({})
    }
  }

  const handleUpload = async () => {
    if (!selectedAppointment || !selectedFile || !authModel) return

    setUploadError(null)
    setUploadProgress(0)

    try {
      await uploadMutation.mutateAsync({
        input: {
          file: selectedFile,
          appointmentId: selectedAppointment.id,
          uploadedBy: authModel.id,
          repName: getDisplayName(authModel),
          notes: notes.trim() || undefined,
        },
        onProgress: setUploadProgress,
      })

      setSelectedFile(null)
      setNotes('')
      setUploadProgress(null)
      setSnackbar({
        message: 'Foglio firma caricato. L\'Unità Centrale riceverà una notifica.',
        severity: 'success',
      })
      navigate(`/rep/appointments/${selectedAppointment.id}`)
    } catch (error) {
      setUploadProgress(null)
      const message =
        error instanceof Error ? error.message : 'Errore nel caricamento del foglio firma.'
      setUploadError(message)
      setSnackbar({ message, severity: 'error' })
    }
  }

  const isLoading = appointmentsLoading || sheetsLoading
  const summary = summarizeRepSheets(uploadedSheets)

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        I miei documenti
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Carica il foglio firma delle visite confermate. Dopo l&apos;upload la visita passa a completata.
      </Typography>

      {uploadedSheets.length > 0 ? (
        <DocumentStatusSummary
          items={[
            { label: 'In elaborazione', value: summary.inProgress, color: '#ed6c02' },
            { label: 'Ricevuto da UC', value: summary.received, color: '#2e7d32' },
          ]}
        />
      ) : null}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Carica foglio firma
          </Typography>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : uploadableAppointments.length === 0 ? (
            <Alert severity="info">
              Nessuna visita confermata in attesa di foglio firma.
            </Alert>
          ) : (
            <>
              <TextField
                select
                label="Appuntamento *"
                value={selectedAppointmentId}
                onChange={(event) => handleAppointmentChange(event.target.value)}
                fullWidth
                disabled={uploadMutation.isPending}
              >
                <MenuItem value="">
                  <em>Seleziona un appuntamento</em>
                </MenuItem>
                {uploadableAppointments.map((appointment) => (
                  <MenuItem key={appointment.id} value={appointment.id}>
                    {getCompanyName(appointment)} · {formatDateTime(appointment.scheduled_datetime)}
                  </MenuItem>
                ))}
              </TextField>

              {selectedAppointment && !canUpload ? (
                <Alert severity="warning">
                  {existingSheet || appointmentsWithSheet.has(selectedAppointment.id)
                    ? 'Questo appuntamento ha già un foglio firma caricato.'
                    : 'Il foglio firma può essere caricato solo per visite confermate.'}
                </Alert>
              ) : null}

              {canUpload ? (
                <>
                  <FileUploadZone
                    file={selectedFile}
                    onFileChange={setSelectedFile}
                    disabled={!canUpload}
                    isUploading={uploadMutation.isPending}
                    uploadProgress={uploadProgress}
                    error={uploadError}
                  />

                  <TextField
                    label="Note (opzionale)"
                    multiline
                    minRows={2}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    fullWidth
                    disabled={uploadMutation.isPending}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      disabled={!selectedFile || uploadMutation.isPending}
                      onClick={() => void handleUpload()}
                    >
                      {uploadMutation.isPending ? 'Caricamento…' : 'Carica documento'}
                    </Button>
                  </Box>
                </>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Documenti caricati
          </Typography>

          {sheetsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={28} />
            </Box>
          ) : uploadedSheets.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nessun documento caricato.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {uploadedSheets.map((sheet) => {
                const companyName = sheet.expand?.appointment
                  ? getCompanyName(sheet.expand.appointment)
                  : undefined

                return (
                  <DocumentListItem
                    key={sheet.id}
                    sheet={sheet}
                    subtitle={
                      companyName
                        ? `${companyName} · ${formatDateTime(sheet.created)}`
                        : `Caricato il ${formatDateTime(sheet.created)}`
                    }
                    onDetail={() => navigate(`/rep/appointments/${sheet.appointment}`)}
                  />
                )
              })}
            </Box>
          )}
        </CardContent>
      </Card>

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
