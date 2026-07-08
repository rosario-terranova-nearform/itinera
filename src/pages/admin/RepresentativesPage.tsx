import { useMemo, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import {
  useCreateRepresentativeMutation,
  useRepresentativesQuery,
  useToggleRepresentativeActiveMutation,
} from '@/hooks/useRepresentatives'
import { getDisplayName, type UserRecord } from '@/types'
import {
  getCreateRepresentativeErrorMessage,
  getToggleRepresentativeActiveErrorMessage,
} from '@/utils/userErrors'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import EmptyState from '@/components/common/EmptyState'
import TableSkeleton from '@/components/common/TableSkeleton'
import { notify } from '@/utils/toast'

const createRepSchema = z.object({
  first_name: z.string().min(1, 'Il nome è obbligatorio'),
  last_name: z.string().min(1, 'Il cognome è obbligatorio'),
  email: z.string().email('Indirizzo email non valido'),
})

type CreateRepForm = z.infer<typeof createRepSchema>

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: ReactNode
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

export default function RepresentativesPage() {
  const { data: representatives = [], isLoading, error: loadError } = useRepresentativesQuery()
  const createMutation = useCreateRepresentativeMutation()
  const toggleMutation = useToggleRepresentativeActiveMutation()

  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<UserRecord | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRepForm>({
    resolver: zodResolver(createRepSchema),
    defaultValues: { first_name: '', last_name: '', email: '' },
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return representatives
    return representatives.filter((rep) => {
      const name = getDisplayName(rep).toLowerCase()
      return name.includes(q) || rep.email.toLowerCase().includes(q)
    })
  }, [representatives, search])

  const stats = useMemo(() => {
    const active = representatives.filter((r) => r.is_active !== false).length
    return {
      total: representatives.length,
      active,
      inactive: representatives.length - active,
    }
  }, [representatives])

  const handleCreate = handleSubmit(async (data) => {
    try {
      const result = await createMutation.mutateAsync(data)
      reset()
      setCreateOpen(false)
      if (result.welcomeEmailSent) {
        notify.success('Rappresentante creato. Email di benvenuto inviata.')
      } else {
        notify.warning(
          'Rappresentante creato. Email di benvenuto non inviata: verifica le impostazioni SMTP in PocketBase.',
        )
      }
    } catch (err) {
      notify.error(getCreateRepresentativeErrorMessage(err))
    }
  })

  const handleToggleActive = async (rep: UserRecord, is_active: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id: rep.id, is_active })
      setConfirmDeactivate(null)
      notify.success(is_active ? 'Rappresentante riattivato.' : 'Rappresentante disattivato.')
    } catch (err) {
      notify.error(getToggleRepresentativeActiveErrorMessage(err))
    }
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
            Gestione Rappresentanti
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestisci i rappresentanti dell&apos;Unità Centrale e i relativi permessi.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
        >
          Nuovo rappresentante
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <SummaryCard
          label="Totale"
          value={stats.total}
          icon={<PeopleIcon />}
          color="#005dac"
        />
        <SummaryCard
          label="Attivi"
          value={stats.active}
          icon={<CheckCircleIcon />}
          color="#2E7D32"
        />
        <SummaryCard
          label="Inattivi"
          value={stats.inactive}
          icon={<CancelIcon />}
          color="#757575"
        />
      </Box>

      <TextField
        placeholder="Cerca rappresentanti..."
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
          Errore nel caricamento dei rappresentanti.
        </Alert>
      )}

      {isLoading ? (
        <TableSkeleton rows={4} columns={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nessun rappresentante"
          description={
            search.trim()
              ? 'Nessun rappresentante corrisponde alla ricerca.'
              : 'Non ci sono ancora rappresentanti registrati.'
          }
          action={
            !search.trim() ? (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                Nuovo rappresentante
              </Button>
            ) : undefined
          }
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefono</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((rep) => {
                const active = rep.is_active !== false
                return (
                  <TableRow key={rep.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>{getDisplayName(rep)}</Typography>
                    </TableCell>
                    <TableCell>{rep.email}</TableCell>
                    <TableCell>{rep.phone || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={active ? 'Attivo' : 'Inattivo'}
                        size="small"
                        color={active ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {active ? (
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => setConfirmDeactivate(rep)}
                          disabled={toggleMutation.isPending}
                        >
                          Disattiva
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleToggleActive(rep, true)}
                          disabled={toggleMutation.isPending}
                        >
                          Riattiva
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={createOpen}
        onClose={() => !createMutation.isPending && setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nuovo rappresentante</DialogTitle>
        <Box component="form" onSubmit={handleCreate} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome"
              {...register('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              fullWidth
              autoFocus
            />
            <TextField
              label="Cognome"
              {...register('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              Verrà inviata un&apos;email con il link per impostare la password.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={createMutation.isPending}>
              Annulla
            </Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Crea'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!confirmDeactivate}
        title="Disattivare il rappresentante?"
        message={
          confirmDeactivate
            ? `${getDisplayName(confirmDeactivate)} non potrà più accedere all'applicazione.`
            : ''
        }
        confirmLabel="Disattiva"
        confirmColor="warning"
        onConfirm={() => confirmDeactivate && handleToggleActive(confirmDeactivate, false)}
        onCancel={() => setConfirmDeactivate(null)}
        isLoading={toggleMutation.isPending}
      />
    </Box>
  )
}
