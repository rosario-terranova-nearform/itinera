import { Route } from 'react-router-dom'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import RepresentativesPage from '@/pages/admin/RepresentativesPage'

export const adminRouteElements = (
  <>
    <Route index element={<AdminDashboardPage />} />
    <Route path="representatives" element={<RepresentativesPage />} />
    <Route path="calendar" element={<AdminDashboardPage />} />
    <Route path="companies" element={<AdminDashboardPage />} />
    <Route path="documents" element={<AdminDashboardPage />} />
    <Route path="settings" element={<AdminDashboardPage />} />
    <Route path="*" element={<AdminDashboardPage />} />
  </>
)
