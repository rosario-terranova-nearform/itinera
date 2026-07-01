import { Route } from 'react-router-dom'
import RepDashboardPage from '@/pages/representative/RepDashboardPage'
import RepCalendarPage from '@/pages/representative/RepCalendarPage'

export const repRouteElements = (
  <>
    <Route index element={<RepDashboardPage />} />
    <Route path="calendar" element={<RepCalendarPage />} />
    <Route path="appointments" element={<RepDashboardPage />} />
    <Route path="companies" element={<RepDashboardPage />} />
    <Route path="documents" element={<RepDashboardPage />} />
    <Route path="profile" element={<RepDashboardPage />} />
    <Route path="*" element={<RepDashboardPage />} />
  </>
)
