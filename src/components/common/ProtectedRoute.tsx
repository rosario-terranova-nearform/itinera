import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import pb from '@/lib/pocketbase'

interface Props {
  allowedRole: 'admin' | 'representative'
}

export default function ProtectedRoute({ allowedRole }: Props) {
  const authModel = useAuthStore((s) => s.authModel)

  if (!pb.authStore.isValid || !authModel) {
    return <Navigate to="/login" replace />
  }

  if (authModel.role !== allowedRole) {
    return <Navigate to={authModel.role === 'admin' ? '/admin' : '/rep'} replace />
  }

  return <Outlet />
}
