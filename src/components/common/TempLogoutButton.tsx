import Button from '@mui/material/Button'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function TempLogoutButton() {
  const navigate = useNavigate()
  const authModel = useAuthStore((s) => s.authModel)
  const logout = useAuthStore((s) => s.logout)

  if (!authModel) return null

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Button
      variant="outlined"
      color="error"
      size="small"
      onClick={handleLogout}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        opacity: 0.85,
      }}
    >
      Logout (temp)
    </Button>
  )
}
