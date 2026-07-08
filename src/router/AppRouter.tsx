import { Routes, Route } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ErrorPage from '@/pages/ErrorPage'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import RootRedirect from '@/components/common/RootRedirect'
import AdminLayout from '@/components/layout/AdminLayout'
import RepLayout from '@/components/layout/RepLayout'
import { adminRouteElements } from '@/router/AdminRoutes'
import { repRouteElements } from '@/router/RepRoutes'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin" />}>
        <Route element={<AdminLayout />}>{adminRouteElements}</Route>
      </Route>
      <Route path="/rep" element={<ProtectedRoute allowedRole="representative" />}>
        <Route element={<RepLayout />}>{repRouteElements}</Route>
      </Route>
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
