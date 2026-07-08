import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import PersonIcon from '@mui/icons-material/Person'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import pb from '@/lib/pocketbase'
import {
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from '@/hooks/useProfile'
import { useAuth } from '@/hooks/useAuth'
import { getDisplayName } from '@/types'
import { notify } from '@/utils/toast'

const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'Nome obbligatorio'),
  last_name: z.string().trim().min(1, 'Cognome obbligatorio'),
  phone: z.string().trim(),
})

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Password attuale obbligatoria'),
    password: z.string().min(8, 'La nuova password deve avere almeno 8 caratteri'),
    passwordConfirm: z.string().min(1, 'Conferma la nuova password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Le password non coincidono',
    path: ['passwordConfirm'],
  })

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?'
}

function getAvatarUrl(user: { id: string; avatar: string }): string {
  return pb.files.getUrl(user, user.avatar)
}

export default function RepProfilePage() {
  const { authModel } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateProfileMutation = useUpdateProfileMutation()
  const uploadAvatarMutation = useUploadAvatarMutation()
  const updatePasswordMutation = useUpdatePasswordMutation()

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      first_name: authModel?.first_name ?? '',
      last_name: authModel?.last_name ?? '',
      phone: authModel?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      password: '',
      passwordConfirm: '',
    },
  })

  if (!authModel) return null

  const avatarUrl = authModel.avatar ? getAvatarUrl(authModel) : undefined
  const isSavingProfile =
    updateProfileMutation.isPending || uploadAvatarMutation.isPending

  const handleProfileSave = profileForm.handleSubmit(async (data) => {
    try {
      await updateProfileMutation.mutateAsync({ id: authModel.id, data })
      notify.success('Profilo aggiornato con successo.')
    } catch {
      notify.error('Errore nell\'aggiornamento del profilo.')
    }
  })

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadAvatarMutation.mutateAsync({ id: authModel.id, file })
      notify.success('Foto profilo aggiornata.')
    } catch {
      notify.error('Errore nel caricamento della foto.')
    } finally {
      event.target.value = ''
    }
  }

  const handlePasswordSave = passwordForm.handleSubmit(async (data) => {
    try {
      await updatePasswordMutation.mutateAsync({ id: authModel.id, data })
      passwordForm.reset()
      notify.success('Password aggiornata con successo.')
    } catch {
      notify.error('Errore nel cambio password. Verifica la password attuale.')
    }
  })

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Impostazioni profilo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Gestisci i tuoi dati personali e la sicurezza dell&apos;account.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '280px 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Card variant="outlined">
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
            <Avatar src={avatarUrl} sx={{ width: 96, height: 96, mb: 2, fontSize: '2rem' }}>
              {getInitials(authModel.first_name, authModel.last_name)}
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center' }}>
              {getDisplayName(authModel)}
            </Typography>
            {authModel.job_title ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
                {authModel.job_title}
              </Typography>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleAvatarChange}
            />
            <Button
              variant="outlined"
              startIcon={
                uploadAvatarMutation.isPending ? (
                  <CircularProgress size={18} />
                ) : (
                  <CloudUploadOutlinedIcon />
                )
              }
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              sx={{ mt: 2 }}
            >
              Carica nuova foto
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card variant="outlined" component="form" onSubmit={handleProfileSave}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon sx={{ color: 'text.secondary' }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Informazioni personali
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <TextField
                  label="Nome"
                  {...profileForm.register('first_name')}
                  error={!!profileForm.formState.errors.first_name}
                  helperText={profileForm.formState.errors.first_name?.message}
                />
                <TextField
                  label="Cognome"
                  {...profileForm.register('last_name')}
                  error={!!profileForm.formState.errors.last_name}
                  helperText={profileForm.formState.errors.last_name?.message}
                />
                <TextField
                  label="Telefono"
                  {...profileForm.register('phone')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Email"
                  value={authModel.email}
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button type="submit" variant="contained" disabled={isSavingProfile}>
                  {isSavingProfile ? <CircularProgress size={22} color="inherit" /> : 'Salva modifiche'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" component="form" onSubmit={handlePasswordSave}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Sicurezza account
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Password attuale"
                  type="password"
                  {...passwordForm.register('oldPassword')}
                  error={!!passwordForm.formState.errors.oldPassword}
                  helperText={passwordForm.formState.errors.oldPassword?.message}
                />
                <TextField
                  label="Nuova password"
                  type="password"
                  {...passwordForm.register('password')}
                  error={!!passwordForm.formState.errors.password}
                  helperText={passwordForm.formState.errors.password?.message}
                />
                <TextField
                  label="Conferma nuova password"
                  type="password"
                  {...passwordForm.register('passwordConfirm')}
                  error={!!passwordForm.formState.errors.passwordConfirm}
                  helperText={passwordForm.formState.errors.passwordConfirm?.message}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? (
                    <CircularProgress size={22} />
                  ) : (
                    'Aggiorna password'
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
