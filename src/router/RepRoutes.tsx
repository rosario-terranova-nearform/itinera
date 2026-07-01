import { Route } from 'react-router-dom'
import RepDashboardPage from '@/pages/representative/RepDashboardPage'
import RepCalendarPage from '@/pages/representative/RepCalendarPage'
import RepCompaniesPage from '@/pages/representative/RepCompaniesPage'

export const repRouteElements = (
  <>
    <Route index element={<RepDashboardPage />} />
    <Route path="calendar" element={<RepCalendarPage />} />
    <Route path="appointments" element={<RepDashboardPage />} />
    <Route path="companies" element={<RepCompaniesPage />} />
    <Route path="documents" element={<RepDashboardPage />} />
    <Route path="profile" element={<RepDashboardPage />} />
    <Route path="*" element={<RepDashboardPage />} />
  </>
)
