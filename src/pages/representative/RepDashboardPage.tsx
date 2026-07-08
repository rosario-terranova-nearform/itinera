import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import NextVisitCard from '@/components/appointments/NextVisitCard'
import EmptyState from '@/components/common/EmptyState'
import StatusChip from '@/components/common/StatusChip'
import { buildCompanyFullAddress, getCompanyName } from '@/api/appointments'
import { useRepUpcomingAppointmentsQuery } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import type { AppointmentRecord, AppointmentStatus } from '@/types'
import { formatUpcomingLabel, getWeekEndIso } from '@/utils/dateUtils'

export default function RepDashboardPage() {
  const navigate = useNavigate()
  const { authModel } = useAuth()
  const {
    data: upcomingAppointments = [],
    isLoading,
    error,
  } = useRepUpcomingAppointmentsQuery(authModel?.id)

  const nextVisit = upcomingAppointments[0] ?? null

  const weekAppointments = useMemo(() => {
    const weekEnd = dayjs(getWeekEndIso())
    return upcomingAppointments.filter((appointment) =>
      dayjs(appointment.scheduled_datetime).isBefore(weekEnd),
    )
  }, [upcomingAppointments])

  const columns: GridColDef<AppointmentRecord>[] = [
    {
      field: 'scheduled_datetime',
      headerName: 'Data e ora',
      flex: 1.2,
      minWidth: 180,
      valueGetter: (_, row) =>
        formatUpcomingLabel(row.scheduled_datetime, row.end_datetime || undefined),
    },
    {
      field: 'company',
      headerName: 'Azienda',
      flex: 1,
      minWidth: 160,
      valueGetter: (_, row) => getCompanyName(row),
    },
    {
      field: 'location',
      headerName: 'Luogo',
      flex: 1.2,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => {
        const address = buildCompanyFullAddress(params.row.expand?.company)
        if (!address) return '—'

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
            <Typography variant="body2" noWrap title={address}>
              {params.row.expand?.company?.city || address}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: 'status',
      headerName: 'Stato',
      width: 130,
      renderCell: (params) => <StatusChip status={params.value as AppointmentStatus} />,
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Button size="small" onClick={() => navigate(`/rep/appointments/${params.row.id}`)}>
          Dettaglio
        </Button>
      ),
    },
  ]

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Panoramica
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Ecco il tuo programma e le attività in arrivo.
        </Typography>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Errore nel caricamento degli appuntamenti.
        </Alert>
      ) : null}

      {isLoading ? (
        <Box>
          <Skeleton variant="rounded" height={160} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={240} />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            {nextVisit ? (
              <NextVisitCard appointment={nextVisit} />
            ) : (
              <EmptyState
                title="Nessuna visita in programma"
                description="Non hai appuntamenti futuri al momento."
              />
            )}
          </Box>

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Settimana in arrivo
            </Typography>

            <Card variant="outlined">
              <DataGrid
                rows={weekAppointments}
                columns={columns}
                disableRowSelectionOnClick
                autoHeight
                getRowId={(row) => row.id}
                hideFooter={weekAppointments.length <= 5}
                pageSizeOptions={[5, 10]}
                initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                localeText={{
                  noRowsLabel: 'Nessun appuntamento in programma questa settimana',
                }}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                }}
              />
            </Card>
          </Box>
        </>
      )}
    </Box>
  )
}
