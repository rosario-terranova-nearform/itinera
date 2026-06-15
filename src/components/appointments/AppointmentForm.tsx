import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs, { type Dayjs } from 'dayjs'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Autocomplete from '@mui/material/Autocomplete'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { useCompaniesQuery } from '@/hooks/useCompanies'
import { useRepresentativesQuery } from '@/hooks/useRepresentatives'
import { getDisplayName, type AppointmentRecord, type CompanyRecord, type UserRecord } from '@/types'

const appointmentSchema = z.object({
  companyId: z.string().min(1, 'Seleziona un\'azienda'),
  representativeId: z.string().min(1, 'Seleziona un rappresentante'),
  scheduled_datetime: z.custom<Dayjs>(
    (val) => dayjs.isDayjs(val) && val.isValid(),
    'Data e ora obbligatorie',
  ),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AppointmentFormData) => Promise<void>
  initialData?: AppointmentRecord
  title?: string
  isPending?: boolean
}

export default function AppointmentForm({
  open,
  onClose,
  onSubmit,
  initialData,
  title = initialData ? 'Modifica appuntamento' : 'Nuovo appuntamento',
  isPending = false,
}: AppointmentFormProps) {
  const { data: companies = [] } = useCompaniesQuery('is_active = true')
  const { data: representatives = [] } = useRepresentativesQuery()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      companyId: '',
      representativeId: '',
      scheduled_datetime: dayjs().add(1, 'day').hour(9).minute(0),
      notes: '',
      internal_notes: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      companyId: initialData?.company ?? '',
      representativeId: initialData?.representative ?? '',
      scheduled_datetime: initialData?.scheduled_datetime
        ? dayjs(initialData.scheduled_datetime)
        : dayjs().add(1, 'day').hour(9).minute(0),
      notes: initialData?.notes ?? '',
      internal_notes: initialData?.internal_notes ?? '',
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
          <Controller
            name="companyId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={companies}
                getOptionLabel={(option: CompanyRecord) => option.name}
                value={companies.find((c) => c.id === field.value) ?? null}
                onChange={(_, value) => field.onChange(value?.id ?? '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Azienda *"
                    error={!!errors.companyId}
                    helperText={errors.companyId?.message}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          />

          <Controller
            name="representativeId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                options={representatives}
                getOptionLabel={(option: UserRecord) => getDisplayName(option)}
                value={representatives.find((r) => r.id === field.value) ?? null}
                onChange={(_, value) => field.onChange(value?.id ?? '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rappresentante *"
                    error={!!errors.representativeId}
                    helperText={errors.representativeId?.message}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          />

          <Controller
            name="scheduled_datetime"
            control={control}
            render={({ field }) => (
              <DateTimePicker
                label="Data e ora *"
                value={field.value}
                onChange={(value) => field.onChange(value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.scheduled_datetime,
                    helperText: errors.scheduled_datetime?.message,
                  },
                }}
              />
            )}
          />

          <TextField
            label="Note (visibili al rappresentante)"
            {...register('notes')}
            error={!!errors.notes}
            helperText={errors.notes?.message}
            fullWidth
            multiline
            rows={2}
          />

          <TextField
            label="Note interne UC"
            {...register('internal_notes')}
            error={!!errors.internal_notes}
            helperText={errors.internal_notes?.message}
            fullWidth
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isPending}>
            Annulla
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? (
              <CircularProgress size={22} color="inherit" />
            ) : initialData ? (
              'Salva'
            ) : (
              'Crea'
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}
