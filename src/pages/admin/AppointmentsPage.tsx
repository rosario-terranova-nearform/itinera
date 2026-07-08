import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import AddIcon from '@mui/icons-material/Add'
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import AppointmentForm, { type AppointmentFormData } from '@/components/appointments/AppointmentForm'
import StatusChip from '@/components/common/StatusChip'
import {
  useAppointmentsQuery,
  useCreateAppointmentMutation,
} from '@/hooks/useAppointments'
import { useUnreadSignedSheetsMapQuery } from '@/hooks/useSignedSheets'
import { useRepresentativesQuery } from '@/hooks/useRepresentatives'
import { useAuth } from '@/hooks/useAuth'
import { getCompanyName, getRepresentativeName } from '@/api/appointments'
import { formatDateTime } from '@/utils/dateUtils'
import { notify } from '@/utils/toast'
import type { AppointmentStatus } from '@/types'

const STATUS_OPTIONS: Array<{ value: AppointmentStatus | ''; label: string }> = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'pending', label: 'In attesa' },
  { value: 'confirmed', label: 'Confermato' },
  { value: 'completed', label: 'Completato' },
  { value: 'cancelled', label: 'Annullato' },
]

export default function AppointmentsPage() {
  const navigate = useNavigate()
  const { authModel } = useAuth()
  const { data: representatives = [] } = useRepresentativesQuery()

  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('')
  const [repFilter, setRepFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const queryOptions = useMemo(
    () => ({
      status: statusFilter,
      representativeId: repFilter,
      dateFrom: dateFrom ? dayjs(dateFrom).startOf('day').toISOString() : undefined,
      dateTo: dateTo ? dayjs(dateTo).endOf('day').toISOString() : undefined,
    }),
    [statusFilter, repFilter, dateFrom, dateTo],
  )

  const { data: appointments = [], isLoading, error: loadError } = useAppointmentsQuery(queryOptions)
  const { data: unreadSheetsMap = new Map() } = useUnreadSignedSheetsMapQuery()
  const createMutation = useCreateAppointmentMutation()

  const handleCreate = async (data: AppointmentFormData) => {
    if (!authModel?.id) return
    try {
      await createMutation.mutateAsync({
        company: data.companyId,
        representative: data.representativeId,
        scheduled_datetime: data.scheduled_datetime.toISOString(),
        notes: data.notes,
        internal_notes: data.internal_notes,
        created_by: authModel.id,
      })
      setFormOpen(false)
      notify.success('Appuntamento creato. Il rappresentante riceverà una notifica.')
    } catch {
      notify.error('Errore nella creazione dell\'appuntamento.')
    }
  }

  const columns: GridColDef[] = [
    {
      field: 'scheduled_datetime',
      headerName: 'Data',
      width: 160,
      valueFormatter: (value: string) => formatDateTime(value),
    },
    {
      field: 'representative',
      headerName: 'Rappresentante',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => getRepresentativeName(row),
    },
    {
      field: 'company',
      headerName: 'Azienda',
      flex: 1,
      minWidth: 180,
      valueGetter: (_, row) => getCompanyName(row),
    },
    {
      field: 'status',
      headerName: 'Stato',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <StatusChip status={params.value as AppointmentStatus} />
          {unreadSheetsMap.has(params.row.id) ? (
            <Chip
              size="small"
              icon={<MarkEmailUnreadIcon sx={{ fontSize: '14px !important' }} />}
              label="Non letto"
              color="warning"
              variant="outlined"
              sx={{ height: 24, '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' } }}
            />
          ) : null}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button size="small" onClick={() => navigate(`/admin/appointments/${params.row.id}`)}>
          Dettaglio
        </Button>
      ),
    },
  ]

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
            Appuntamenti
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Elenco completo degli incarichi pianificati.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          Crea appuntamento
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Stato"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Rappresentante"
          value={repFilter}
          onChange={(e) => setRepFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tutti</MenuItem>
          {representatives.map((rep) => (
            <MenuItem key={rep.id} value={rep.id}>
              {rep.first_name} {rep.last_name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Da"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          label="A"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      {loadError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento degli appuntamenti.
        </Alert>
      ) : null}

      <Card variant="outlined">
        <DataGrid
          rows={appointments}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          autoHeight
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          onRowClick={(params) => navigate(`/admin/appointments/${params.row.id}`)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Card>

      <AppointmentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

    </Box>
  )
}
