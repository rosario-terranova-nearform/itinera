import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import DescriptionIcon from '@mui/icons-material/Description'
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DocumentStatusSummary from '@/components/documents/DocumentStatusSummary'
import {
  getAdminSheetStatusColor,
  getAdminSheetStatusLabel,
  summarizeAdminSheets,
  useAllSignedSheetsQuery,
} from '@/hooks/useSignedSheets'
import { useRepresentativesQuery } from '@/hooks/useRepresentatives'
import { getCompanyName } from '@/api/appointments'
import { getDisplayName } from '@/types'
import { formatDateTime } from '@/utils/dateUtils'
import type { SignedSheetRecord } from '@/types'

const VIEWED_OPTIONS = [
  { value: '', label: 'Tutti gli stati' },
  { value: 'unread', label: 'Non letti' },
  { value: 'viewed', label: 'Visualizzati' },
] as const

function getAppointmentCompanyName(sheet: SignedSheetRecord): string {
  const appointment = sheet.expand?.appointment
  if (!appointment) return '—'
  return getCompanyName(appointment)
}

function getRepresentativeName(sheet: SignedSheetRecord): string {
  const rep = sheet.expand?.uploaded_by
  if (!rep) return '—'
  return getDisplayName(rep)
}

export default function DocumentsPortalPage() {
  const navigate = useNavigate()
  const { data: representatives = [] } = useRepresentativesQuery()

  const [viewedFilter, setViewedFilter] = useState<'' | 'unread' | 'viewed'>('')
  const [repFilter, setRepFilter] = useState('')
  const [search, setSearch] = useState('')

  const queryFilter = useMemo(
    () => ({
      viewed:
        viewedFilter === 'unread' ? false : viewedFilter === 'viewed' ? true : undefined,
      representativeId: repFilter || undefined,
      search: search.trim() || undefined,
    }),
    [viewedFilter, repFilter, search],
  )

  const { data: allSheets = [], isLoading, error: loadError } = useAllSignedSheetsQuery()
  const { data: filteredSheets = [], isLoading: filterLoading } =
    useAllSignedSheetsQuery(queryFilter)

  const summary = useMemo(() => summarizeAdminSheets(allSheets), [allSheets])

  const columns: GridColDef<SignedSheetRecord>[] = [
    {
      field: 'file_name',
      headerName: 'Documento',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'company',
      headerName: 'Azienda',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => getAppointmentCompanyName(row),
    },
    {
      field: 'representative',
      headerName: 'Rappresentante',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => getRepresentativeName(row),
    },
    {
      field: 'created',
      headerName: 'Caricato il',
      width: 170,
      valueFormatter: (value: string) => formatDateTime(value),
    },
    {
      field: 'viewed_by_admin',
      headerName: 'Stato',
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          label={getAdminSheetStatusLabel(params.row)}
          color={getAdminSheetStatusColor(params.row)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 220,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button
            size="small"
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/admin/appointments/${params.row.appointment}`)
            }}
          >
            Appuntamento
          </Button>
          {params.row.expand?.appointment?.company ? (
            <Button
              size="small"
              onClick={(event) => {
                event.stopPropagation()
                navigate(`/admin/companies/${params.row.expand!.appointment!.company}`)
              }}
            >
              Azienda
            </Button>
          ) : null}
        </Box>
      ),
    },
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Documenti
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Portale fogli firma caricati dai rappresentanti.
        </Typography>
      </Box>

      <DocumentStatusSummary
        items={[
          {
            label: 'Documenti caricati',
            value: summary.total,
            color: '#1976d2',
          },
          {
            label: 'Non letti',
            value: summary.unread,
            color: '#ed6c02',
          },
          {
            label: 'Visualizzati',
            value: summary.viewed,
            color: '#2e7d32',
          },
        ]}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Stato lettura"
          value={viewedFilter}
          onChange={(event) =>
            setViewedFilter(event.target.value as '' | 'unread' | 'viewed')
          }
          size="small"
          sx={{ minWidth: 180 }}
        >
          {VIEWED_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Rappresentante"
          value={repFilter}
          onChange={(event) => setRepFilter(event.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tutti</MenuItem>
          {representatives.map((rep) => (
            <MenuItem key={rep.id} value={rep.id}>
              {getDisplayName(rep)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Cerca per nome file"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ minWidth: 220 }}
        />
      </Box>

      {loadError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento dei documenti.
        </Alert>
      ) : null}

      <Card variant="outlined">
        <DataGrid
          rows={filteredSheets}
          columns={columns}
          loading={isLoading || filterLoading}
          disableRowSelectionOnClick
          autoHeight
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          onRowClick={(params) => navigate(`/admin/appointments/${params.row.appointment}`)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Card>

      {!isLoading && allSheets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            Nessun foglio firma caricato.
          </Typography>
        </Box>
      ) : null}

      {!isLoading && summary.unread > 0 ? (
        <Alert severity="info" icon={<MarkEmailUnreadIcon />} sx={{ mt: 2 }}>
          {summary.unread} document{summary.unread === 1 ? 'o' : 'i'} in attesa di
          visualizzazione.
        </Alert>
      ) : !isLoading && summary.total > 0 ? (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mt: 2 }}>
          Tutti i documenti sono stati visualizzati.
        </Alert>
      ) : null}
    </Box>
  )
}
