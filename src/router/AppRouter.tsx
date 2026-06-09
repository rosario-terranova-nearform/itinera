import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import AdminLayout from '@/components/layout/AdminLayout'
import { adminRouteElements } from '@/router/AdminRoutes'
import RepRoutes from '@/router/RepRoutes'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin" />}>
        <Route element={<AdminLayout />}>{adminRouteElements}</Route>
      </Route>
      <Route path="/rep" element={<ProtectedRoute allowedRole="representative" />}>
        <Route path="*" element={<RepRoutes />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
