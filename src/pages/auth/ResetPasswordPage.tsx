import { useState, useEffect, type FormEvent, type ReactNode } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import pb from '@/lib/pocketbase'
import { useAuth } from '@/hooks/useAuth'
import {
  getPasswordResetConfirmErrorMessage,
  getPasswordResetRequestErrorMessage,
} from '@/utils/authErrors'

const MIN_PASSWORD_LENGTH = 8

function RequestResetForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    setIsLoading(true)
    setError(null)

    try {
      await pb.collection('users').requestPasswordReset(trimmedEmail)
      setSuccess(true)
    } catch (err: unknown) {
      setError(getPasswordResetRequestErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Alert severity="success" sx={{ mb: 2 }}>
          Se l&apos;indirizzo email è registrato, riceverai a breve un link per reimpostare la
          password.
        </Alert>
        <Button component={RouterLink} to="/login" variant="contained" fullWidth size="large">
          Torna al login
        </Button>
      </>
    )
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
        Inserisci la tua email per ricevere un link di reset password.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          autoComplete="email"
          autoFocus
          disabled={isLoading}
          sx={{ mb: 3 }}
        />

        <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
          {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Invia link di reset'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link component={RouterLink} to="/login" variant="body2" underline="hover">
            Torna al login
          </Link>
        </Box>
      </Box>
    </>
  )
}

function ConfirmResetForm({ token }: { token: string }) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(`La password deve contenere almeno ${MIN_PASSWORD_LENGTH} caratteri.`)
      return
    }

    if (password !== passwordConfirm) {
      setValidationError('Le password non coincidono.')
      return
    }

    setIsLoading(true)

    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      setSuccess(true)
    } catch (err: unknown) {
      setError(getPasswordResetConfirmErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <Alert severity="success" sx={{ mb: 2 }}>
          Password aggiornata con successo. Ora puoi accedere con le nuove credenziali.
        </Alert>
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => navigate('/login', { replace: true })}
        >
          Vai al login
        </Button>
      </>
    )
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
        Inserisci la nuova password per il tuo account.
      </Typography>

      {(error || validationError) && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => {
            setError(null)
            setValidationError(null)
          }}
        >
          {validationError ?? error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Nuova password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          autoFocus
          disabled={isLoading}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          label="Conferma password"
          type={showPasswordConfirm ? 'text' : 'password'}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
          disabled={isLoading}
          sx={{ mb: 3 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPasswordConfirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
          {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Imposta nuova password'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link component={RouterLink} to="/reset-password" variant="body2" underline="hover">
            Richiedi un nuovo link
          </Link>
        </Box>
      </Box>
    </>
  )
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { authModel } = useAuth()
  const token = searchParams.get('token')

  useEffect(() => {
    if (authModel && !token) {
      navigate(authModel.role === 'admin' ? '/admin' : '/rep', { replace: true })
    }
  }, [authModel, navigate, token])

  if (!token) {
    return (
      <AuthCard title="Reset password">
        <RequestResetForm />
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Nuova password">
      <ConfirmResetForm token={token} />
    </AuthCard>
  )
}

function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 1,
              color: 'primary.main',
              fontWeight: 700,
            }}
          >
            Itinera
          </Typography>

          <Typography variant="h3" sx={{ textAlign: 'center', mb: 1 }}>
            {title}
          </Typography>

          {children}
        </CardContent>
      </Card>
    </Box>
  )
}
