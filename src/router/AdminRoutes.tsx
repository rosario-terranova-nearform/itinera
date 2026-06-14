import { Route } from 'react-router-dom'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import RepresentativesPage from '@/pages/admin/RepresentativesPage'
import CompaniesPage from '@/pages/admin/CompaniesPage'
import CompanyDetailPage from '@/pages/admin/CompanyDetailPage'

export const adminRouteElements = (
  <>
    <Route index element={<AdminDashboardPage />} />
    <Route path="representatives" element={<RepresentativesPage />} />
    <Route path="calendar" element={<AdminDashboardPage />} />
    <Route path="companies" element={<CompaniesPage />} />
    <Route path="companies/:id" element={<CompanyDetailPage />} />
    <Route path="documents" element={<AdminDashboardPage />} />
    <Route path="settings" element={<AdminDashboardPage />} />
    <Route path="*" element={<AdminDashboardPage />} />
  </>
)
