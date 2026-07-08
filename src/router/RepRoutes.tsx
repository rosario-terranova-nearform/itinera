import { Route, Navigate } from 'react-router-dom'
import RepDashboardPage from '@/pages/representative/RepDashboardPage'
import RepCalendarPage from '@/pages/representative/RepCalendarPage'
import RepCompaniesPage from '@/pages/representative/RepCompaniesPage'
import RepAppointmentDetailPage from '@/pages/representative/RepAppointmentDetailPage'
import RescheduleAppointmentPage from '@/pages/representative/RescheduleAppointmentPage'
import RepProfilePage from '@/pages/representative/RepProfilePage'
import RepDocumentsPage from '@/pages/representative/RepDocumentsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const repRouteElements = (
  <>
    <Route index element={<RepDashboardPage />} />
    <Route path="calendar" element={<RepCalendarPage />} />
    <Route path="appointments/:id/reschedule" element={<RescheduleAppointmentPage />} />
    <Route path="appointments/:id" element={<RepAppointmentDetailPage />} />
    <Route path="companies" element={<RepCompaniesPage />} />
    <Route path="documents" element={<RepDocumentsPage />} />
    <Route path="profile" element={<RepProfilePage />} />
    <Route path="settings" element={<Navigate to="/rep/profile" replace />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
)
