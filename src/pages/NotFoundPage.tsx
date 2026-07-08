import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import { useAuth } from '@/hooks/useAuth'

export default function NotFoundPage() {
  const { authModel } = useAuth()

  const homePath =
    authModel?.role === 'admin'
      ? '/admin'
      : authModel?.role === 'representative'
        ? '/rep'
        : '/login'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        textAlign: 'center',
        bgcolor: 'background.default',
      }}
    >
      <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Pagina non trovata
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        La pagina che stai cercando non esiste o è stata spostata.
      </Typography>
      <Button component={RouterLink} to={homePath} variant="contained">
        Torna alla home
      </Button>
    </Box>
  )
}
