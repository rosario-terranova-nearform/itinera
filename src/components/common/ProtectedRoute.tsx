import { Navigate, Outlet } from 'react-router-dom'
import pb from '@/lib/pocketbase'
import type { UserRecord } from '@/types'

interface Props {
  allowedRole: 'admin' | 'representative'
}

export default function ProtectedRoute({ allowedRole }: Props) {
  const model = pb.authStore.model as UserRecord | null

  if (!pb.authStore.isValid || !model) {
    return <Navigate to="/login" replace />
  }

  if (model.role !== allowedRole) {
    return <Navigate to={model.role === 'admin' ? '/admin' : '/rep'} replace />
  }

  return <Outlet />
}
