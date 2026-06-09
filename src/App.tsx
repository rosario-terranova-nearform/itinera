import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import RepDashboardPage from '@/pages/representative/RepDashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin" />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="*" element={<AdminDashboardPage />} />
      </Route>
      <Route path="/rep" element={<ProtectedRoute allowedRole="representative" />}>
        <Route index element={<RepDashboardPage />} />
        <Route path="*" element={<RepDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
