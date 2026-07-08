import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { useAuth } from '@/hooks/useAuth'

export default function ErrorPage() {
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
      <ErrorOutlineOutlinedIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Si è verificato un errore
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        Qualcosa è andato storto. Riprova o torna alla home.
      </Typography>
      <Button component={RouterLink} to={homePath} variant="contained">
        Torna alla home
      </Button>
    </Box>
  )
}
