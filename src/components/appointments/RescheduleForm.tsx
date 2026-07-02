import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dayjs, { type Dayjs } from 'dayjs'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { buildCompanyFullAddress, getCompanyName } from '@/api/appointments'
import type { AppointmentRecord } from '@/types'
import { formatDate, formatTime } from '@/utils/dateUtils'

const rescheduleSchema = z.object({
  date: z.custom<Dayjs>((val) => dayjs.isDayjs(val) && val.isValid(), 'Data obbligatoria'),
  time: z.custom<Dayjs>((val) => dayjs.isDayjs(val) && val.isValid(), 'Ora obbligatoria'),
  reason: z.string().trim().min(1, 'Il motivo è obbligatorio'),
})

export type RescheduleFormData = z.infer<typeof rescheduleSchema>

interface RescheduleFormProps {
  appointment: AppointmentRecord
  onSubmit: (data: RescheduleFormData) => Promise<void>
  isPending?: boolean
}

export default function RescheduleForm({
  appointment,
  onSubmit,
  isPending = false,
}: RescheduleFormProps) {
  const company = appointment.expand?.company
  const address = buildCompanyFullAddress(company)
  const scheduled = dayjs(appointment.scheduled_datetime)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: scheduled,
      time: scheduled,
      reason: '',
    },
  })

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Dettagli attuali
        </Typography>
        <Card variant="outlined">
          <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BusinessOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Azienda
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {getCompanyName(appointment)}
                </Typography>
                {address ? (
                  <Typography variant="body2" color="text.secondary">
                    {address}
                  </Typography>
                ) : null}
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthOutlinedIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Data
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(appointment.scheduled_datetime)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeOutlinedIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Ora
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatTime(appointment.scheduled_datetime)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Nuova proposta
        </Typography>
        <Card variant="outlined">
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Nuova data *"
                  value={field.value}
                  onChange={field.onChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label="Nuova ora *"
                  value={field.value}
                  onChange={field.onChange}
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.time,
                      helperText: errors.time?.message,
                    },
                  }}
                />
              )}
            />

            <TextField
              label="Motivo della modifica *"
              multiline
              minRows={3}
              placeholder="Spiega brevemente il motivo della riprogrammazione..."
              {...register('reason')}
              error={!!errors.reason}
              helperText={errors.reason?.message}
            />
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={isPending}>
          {isPending ? <CircularProgress size={22} color="inherit" /> : 'Salva nuova data'}
        </Button>
      </Box>
    </Box>
  )
}
