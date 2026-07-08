import { Route } from 'react-router-dom'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import RepresentativesPage from '@/pages/admin/RepresentativesPage'
import CompaniesPage from '@/pages/admin/CompaniesPage'
import CompanyDetailPage from '@/pages/admin/CompanyDetailPage'
import CalendarPage from '@/pages/admin/CalendarPage'
import AppointmentsPage from '@/pages/admin/AppointmentsPage'
import AppointmentDetailPage from '@/pages/admin/AppointmentDetailPage'
import DocumentsPortalPage from '@/pages/admin/DocumentsPortalPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const adminRouteElements = (
  <>
    <Route index element={<AdminDashboardPage />} />
    <Route path="representatives" element={<RepresentativesPage />} />
    <Route path="calendar" element={<CalendarPage />} />
    <Route path="appointments" element={<AppointmentsPage />} />
    <Route path="appointments/:id" element={<AppointmentDetailPage />} />
    <Route path="companies" element={<CompaniesPage />} />
    <Route path="companies/:id" element={<CompanyDetailPage />} />
    <Route path="documents" element={<DocumentsPortalPage />} />
    <Route path="settings" element={<AdminSettingsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
)
