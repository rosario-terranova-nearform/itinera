import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
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
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, clearError, authModel } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (authModel && location.pathname === '/login') {
      navigate(authModel.role === 'admin' ? '/admin' : '/rep', { replace: true })
    }
  }, [authModel, navigate, location.pathname])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    await login(email.trim(), password)
  }

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

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
            Gestione appuntamenti rappresentanti
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
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
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              autoComplete="current-password"
              disabled={isLoading}
              sx={{ mb: 1 }}
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

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link component={RouterLink} to="/reset-password" variant="body2" underline="hover">
                Password dimenticata?
              </Link>
            </Box>

            <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading}>
              {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Accedi'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
