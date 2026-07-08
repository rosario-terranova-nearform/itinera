import { Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '@/hooks/useAuth'
import pb from '@/lib/pocketbase'

export default function RootRedirect() {
  const { authModel, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (!pb.authStore.isValid || !authModel) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={authModel.role === 'admin' ? '/admin' : '/rep'} replace />
}
