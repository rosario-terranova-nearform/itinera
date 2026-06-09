import { Routes, Route } from 'react-router-dom'
import RepDashboardPage from '@/pages/representative/RepDashboardPage'

export default function RepRoutes() {
  return (
    <Routes>
      <Route index element={<RepDashboardPage />} />
      <Route path="*" element={<RepDashboardPage />} />
    </Routes>
  )
}
