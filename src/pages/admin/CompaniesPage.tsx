import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import BusinessIcon from '@mui/icons-material/Business'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import {
  useCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useSoftDeleteCompanyMutation,
} from '@/hooks/useCompanies'
import CompanyForm, { type CompanyFormData } from '@/components/companies/CompanyForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { notify } from '@/utils/toast'
import { type CompanyRecord } from '@/types'

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: color + '1A',
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function CompaniesPage() {
  const navigate = useNavigate()
  const { data: companies = [], isLoading, error: loadError } = useCompaniesQuery()
  const createMutation = useCreateCompanyMutation()
  const updateMutation = useUpdateCompanyMutation()
  const softDeleteMutation = useSoftDeleteCompanyMutation()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<CompanyRecord | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((c) => {
      return c.name.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q)
    })
  }, [companies, search])

  const stats = useMemo(() => {
    const active = companies.filter((c) => c.is_active !== false).length
    return {
      total: companies.length,
      active,
      inactive: companies.length - active,
    }
  }, [companies])

  const handleCreate = async (data: CompanyFormData) => {
    try {
      await createMutation.mutateAsync(data)
      setFormOpen(false)
      notify.success('Azienda creata con successo.')
    } catch {
      notify.error('Errore nella creazione dell\'azienda.')
    }
  }

  const handleEdit = async (data: CompanyFormData) => {
    if (!editingCompany) return
    try {
      await updateMutation.mutateAsync({ id: editingCompany.id, data })
      setEditingCompany(null)
      setFormOpen(false)
      notify.success('Azienda aggiornata con successo.')
    } catch {
      notify.error('Errore nell\'aggiornamento dell\'azienda.')
    }
  }

  const handleSoftDelete = async () => {
    if (!confirmDelete) return
    try {
      await softDeleteMutation.mutateAsync(confirmDelete.id)
      setConfirmDelete(null)
      notify.success('Azienda disattivata.')
    } catch {
      notify.error('Errore nella disattivazione dell\'azienda.')
    }
  }

  const openEditForm = (company: CompanyRecord) => {
    setEditingCompany(company)
    setFormOpen(true)
  }

  const openCreateForm = () => {
    setEditingCompany(null)
    setFormOpen(true)
  }

  const mutationPending = createMutation.isPending || updateMutation.isPending

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: 500,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline', color: 'primary.main' },
          }}
          onClick={() => navigate(`/admin/companies/${params.row.id}`)}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: 'city', headerName: 'Città', width: 140 },
    { field: 'province', headerName: 'Prov.', width: 80 },
    {
      field: 'segment',
      headerName: 'Segmento',
      width: 130,
      renderCell: (params) => {
        if (!params.value) return <Typography color="text.disabled">—</Typography>
        return <Typography>{params.value}</Typography>
      },
    },
    {
      field: 'is_active',
      headerName: 'Stato',
      width: 110,
      renderCell: (params) => {
        const active = params.value !== false
        return (
          <Chip
            label={active ? 'Attiva' : 'Inattiva'}
            size="small"
            color={active ? 'success' : 'default'}
            variant="outlined"
          />
        )
      },
    },
    {
      field: 'actions',
      headerName: '',
      width: 160,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" onClick={() => openEditForm(params.row as CompanyRecord)}>
            Modifica
          </Button>
          {(params.row as CompanyRecord).is_active !== false ? (
            <Button
              size="small"
              color="warning"
              onClick={() => setConfirmDelete(params.row as CompanyRecord)}
            >
              Disattiva
            </Button>
          ) : null}
        </Box>
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
            Gestione Aziende
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestisci l&apos;anagrafica delle aziende clienti.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
          Nuova azienda
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <SummaryCard
          label="Totale"
          value={stats.total}
          icon={<BusinessIcon />}
          color="#005dac"
        />
        <SummaryCard
          label="Attive"
          value={stats.active}
          icon={<CheckCircleIcon />}
          color="#2E7D32"
        />
        <SummaryCard
          label="Inattive"
          value={stats.inactive}
          icon={<CancelIcon />}
          color="#757575"
        />
      </Box>

      <TextField
        placeholder="Cerca aziende per nome o città..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, maxWidth: 400 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Errore nel caricamento delle aziende.
        </Alert>
      )}

      <Card variant="outlined">
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          autoHeight
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
          }}
        />
      </Card>

      <CompanyForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingCompany(null)
        }}
        onSubmit={editingCompany ? handleEdit : handleCreate}
        initialData={editingCompany ?? undefined}
        title={editingCompany ? 'Modifica azienda' : 'Nuova azienda'}
        isPending={mutationPending}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Disattivare l'azienda?"
        message={
          confirmDelete
            ? `${confirmDelete.name} verrà disattivata e non sarà più selezionabile per nuovi appuntamenti.`
            : ''
        }
        confirmLabel="Disattiva"
        confirmColor="warning"
        onConfirm={handleSoftDelete}
        onCancel={() => setConfirmDelete(null)}
        isLoading={softDeleteMutation.isPending}
      />

    </Box>
  )
}
