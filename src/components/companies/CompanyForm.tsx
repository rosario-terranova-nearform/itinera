import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { type CompanyRecord } from '@/types'

const companySchema = z.object({
  name: z.string().min(1, 'Il nome è obbligatorio'),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal_code: z.string().optional(),
  segment: z.enum(['Enterprise', 'Mid-Market', 'SMB']).optional().or(z.literal('')),
  contact_person: z.string().optional(),
  contact_title: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  notes: z.string().optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CompanyFormData) => Promise<void>
  initialData?: CompanyRecord
  title?: string
  isPending?: boolean
}

const SEGMENT_OPTIONS = [
  { value: '', label: 'Nessuno' },
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Mid-Market', label: 'Mid-Market' },
  { value: 'SMB', label: 'SMB' },
]

export default function CompanyForm({
  open,
  onClose,
  onSubmit,
  initialData,
  title = initialData ? 'Modifica azienda' : 'Nuova azienda',
  isPending = false,
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      segment: '',
      contact_person: '',
      contact_title: '',
      phone: '',
      email: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: initialData?.name ?? '',
      address: initialData?.address ?? '',
      city: initialData?.city ?? '',
      province: initialData?.province ?? '',
      postal_code: initialData?.postal_code ?? '',
      segment: (initialData?.segment as CompanyFormData['segment']) ?? '',
      contact_person: initialData?.contact_person ?? '',
      contact_title: initialData?.contact_title ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      notes: initialData?.notes ?? '',
    })
  }, [open, initialData, reset])

  const handleClose = () => {
    if (isPending) return
    reset()
    onClose()
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data)
    reset()
  })

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Box component="form" onSubmit={handleFormSubmit} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Nome *"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
            autoFocus
          />
          <TextField
            label="Indirizzo"
            {...register('address')}
            error={!!errors.address}
            helperText={errors.address?.message}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Città"
              {...register('city')}
              error={!!errors.city}
              helperText={errors.city?.message}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Prov."
              {...register('province')}
              error={!!errors.province}
              helperText={errors.province?.message}
              sx={{ width: 100 }}
              inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
            />
            <TextField
              label="CAP"
              {...register('postal_code')}
              error={!!errors.postal_code}
              helperText={errors.postal_code?.message}
              sx={{ width: 120 }}
            />
          </Box>
          <TextField
            label="Segmento"
            {...register('segment')}
            select
            error={!!errors.segment}
            helperText={errors.segment?.message}
            fullWidth
          >
            {SEGMENT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Referente"
              {...register('contact_person')}
              error={!!errors.contact_person}
              helperText={errors.contact_person?.message}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Titolo referente"
              {...register('contact_title')}
              error={!!errors.contact_title}
              helperText={errors.contact_title?.message}
              sx={{ flex: 1 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Telefono"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ flex: 1 }}
            />
          </Box>
          <TextField
            label="Note"
            {...register('notes')}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isPending}>
            Annulla
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={22} color="inherit" /> : initialData ? 'Salva' : 'Crea'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
