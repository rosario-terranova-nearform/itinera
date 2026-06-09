import { Navigate, Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '@/hooks/useAuth'
import pb from '@/lib/pocketbase'

interface Props {
  allowedRole: 'admin' | 'representative'
}

export default function ProtectedRoute({ allowedRole }: Props) {
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

  if (authModel.role !== allowedRole) {
    return <Navigate to={authModel.role === 'admin' ? '/admin' : '/rep'} replace />
  }

  return <Outlet />
}
