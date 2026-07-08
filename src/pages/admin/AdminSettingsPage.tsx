import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import PeopleIcon from '@mui/icons-material/People'
import EmailIcon from '@mui/icons-material/Email'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { useCreateRepresentativeMutation } from '@/hooks/useRepresentatives'
import { getCreateRepresentativeErrorMessage } from '@/utils/userErrors'
import {
  getEmailNotificationsEnabled,
  setEmailNotificationsEnabled,
} from '@/utils/notificationSettings'
import { notify } from '@/utils/toast'

const createRepSchema = z.object({
  first_name: z.string().min(1, 'Il nome è obbligatorio'),
  last_name: z.string().min(1, 'Il cognome è obbligatorio'),
  email: z.string().email('Indirizzo email non valido'),
})

type CreateRepForm = z.infer<typeof createRepSchema>

export default function AdminSettingsPage() {
  const createMutation = useCreateRepresentativeMutation()
  const [emailNotifications, setEmailNotifications] = useState(getEmailNotificationsEnabled)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRepForm>({
    resolver: zodResolver(createRepSchema),
    defaultValues: { first_name: '', last_name: '', email: '' },
  })

  const handleEmailToggle = (enabled: boolean) => {
    setEmailNotifications(enabled)
    setEmailNotificationsEnabled(enabled)
    notify.info(
      enabled
        ? 'Notifiche email abilitate.'
        : 'Notifiche email disabilitate (preferenza salvata localmente).',
    )
  }

  const handleCreateRep = handleSubmit(async (data) => {
    try {
      const result = await createMutation.mutateAsync(data)
      reset()
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

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 800 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Impostazioni
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configura account rappresentanti e preferenze di notifica.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PeopleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Crea rappresentante
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Crea un nuovo account rappresentante. Verrà inviata un&apos;email con il link per
            impostare la password.
          </Typography>
          <Box
            component="form"
            onSubmit={handleCreateRep}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Nome"
              {...register('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
              fullWidth
              size="small"
            />
            <TextField
              label="Cognome"
              {...register('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
              size="small"
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'Crea rappresentante'
                )}
              </Button>
              <Button component={RouterLink} to="/admin/representatives" variant="outlined">
                Gestisci tutti i rappresentanti
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifiche email
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) => handleEmailToggle(e.target.checked)}
              />
            }
            label="Invio automatico notifiche email"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Il mittente SMTP si configura in PocketBase Admin UI (Settings → Mail settings).
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ opacity: 0.85 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ScheduleIcon color="disabled" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Riepilogo email giornaliero
            </Typography>
            <Chip label="Prossimamente" size="small" variant="outlined" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info" variant="outlined">
            L&apos;invio automatico di un riepilogo giornaliero alle 08:00 non è ancora
            disponibile. Sarà implementato in una versione futura.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}
