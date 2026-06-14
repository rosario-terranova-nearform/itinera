import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BusinessIcon from '@mui/icons-material/Business'
import {
  useCompanyQuery,
  useUpdateCompanyMutation,
} from '@/hooks/useCompanies'
import { useCompanyAppointmentsQuery } from '@/hooks/useAppointments'
import CompanyForm, { type CompanyFormData } from '@/components/companies/CompanyForm'
import { getDisplayName } from '@/types'
import { formatDate } from '@/utils/dateUtils'
import { type CompaniesSegmentOptions as SegmentOptions } from '@/lib/pb.types'

const SEGMENT_LABELS: Record<SegmentOptions, string> = {
  Enterprise: 'Enterprise',
  'Mid-Market': 'Mid-Market',
  SMB: 'SMB',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'In attesa',
  confirmed: 'Confermato',
  completed: 'Completato',
  cancelled: 'Annullato',
}

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

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: company, isLoading, error: loadError } = useCompanyQuery(id ?? '')
  const { data: appointments = [], isLoading: apptsLoading } = useCompanyAppointmentsQuery(id ?? '')
  const updateMutation = useUpdateCompanyMutation()

  const [tabIndex, setTabIndex] = useState(0)
  const [editOpen, setEditOpen] = useState(false)

  const handleEdit = async (data: CompanyFormData) => {
    if (!id) return
    await updateMutation.mutateAsync({ id, data })
    setEditOpen(false)
  }

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (loadError || !company) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento dell&apos;azienda.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/companies')}>
          Torna alle aziende
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/companies')}
        sx={{ mb: 2 }}
      >
        Torna alle aziende
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 1.5,
            bgcolor: '#005dac1A',
            color: '#005dac',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BusinessIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {company.name}
            </Typography>
            <Chip
              label={company.is_active !== false ? 'Attiva' : 'Inattiva'}
              size="small"
              color={company.is_active !== false ? 'success' : 'default'}
              variant="outlined"
            />
            {company.segment ? (
              <Chip label={SEGMENT_LABELS[company.segment as SegmentOptions] || company.segment} size="small" variant="outlined" />
            ) : null}
          </Box>
          {company.city && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {[company.address, company.city, company.province].filter(Boolean).join(', ')}
            </Typography>
          )}
        </Box>
        <Button variant="outlined" onClick={() => setEditOpen(true)}>
          Modifica
        </Button>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Informazioni
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
            <Box>
              <InfoRow label="Indirizzo" value={company.address || '—'} />
              <InfoRow label="Città" value={company.city || '—'} />
              <InfoRow label="Provincia" value={company.province || '—'} />
              <InfoRow label="CAP" value={company.postal_code || '—'} />
              <InfoRow
                label="Segmento"
                value={company.segment ? (SEGMENT_LABELS[company.segment as SegmentOptions] || company.segment) : '—'}
              />
            </Box>
            <Box>
              <InfoRow label="Referente" value={company.contact_person || '—'} />
              <InfoRow label="Titolo referente" value={company.contact_title || '—'} />
              <InfoRow label="Telefono" value={company.phone || '—'} />
              <InfoRow label="Email" value={company.email || '—'} />
            </Box>
          </Box>
          {company.notes ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Note
              </Typography>
              <Typography variant="body2">{company.notes}</Typography>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label={`Appuntamenti (${appointments.length})`} />
        </Tabs>

        {tabIndex === 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ border: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Rappresentante</TableCell>
                  <TableCell>Codice</TableCell>
                  <TableCell>Stato</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apptsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        Nessun appuntamento trovato per questa azienda.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appt) => (
                    <TableRow
                      key={appt.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/appointments/${appt.id}`)}
                    >
                      <TableCell>{formatDate(appt.scheduled_datetime)}</TableCell>
                      <TableCell>
                        {appt.expand?.representative
                          ? getDisplayName(appt.expand.representative)
                          : '—'}
                      </TableCell>
                      <TableCell>{appt.reference_code || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[appt.status] || appt.status}
                          size="small"
                          color={
                            appt.status === 'confirmed'
                              ? 'success'
                              : appt.status === 'pending'
                                ? 'warning'
                                : appt.status === 'completed'
                                  ? 'primary'
                                  : appt.status === 'cancelled'
                                    ? 'error'
                                    : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <CompanyForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        initialData={company}
        title="Modifica azienda"
        isPending={updateMutation.isPending}
      />
    </Box>
  )
}
