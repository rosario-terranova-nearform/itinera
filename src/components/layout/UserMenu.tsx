import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import LogoutIcon from '@mui/icons-material/Logout'
import pb from '@/lib/pocketbase'
import { useAuthStore } from '@/store/authStore'
import type { UserRecord } from '@/types'

function getInitials(user: Pick<UserRecord, 'first_name' | 'last_name'>): string {
  const first = user.first_name?.charAt(0) ?? ''
  const last = user.last_name?.charAt(0) ?? ''
  return (first + last).toUpperCase() || '?'
}

function getAvatarUrl(user: UserRecord): string | undefined {
  if (!user.avatar) return undefined
  return pb.files.getUrl(user, user.avatar)
}

export default function UserMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.authModel)
  const logout = useAuthStore((s) => s.logout)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  if (!user) return null

  const handleLogout = () => {
    setAnchorEl(null)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Menu utente"
        aria-controls={anchorEl ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? 'true' : undefined}
        size="small"
        sx={{ p: 0.5 }}
      >
        <Avatar src={getAvatarUrl(user)} alt="" sx={{ width: 36, height: 36 }}>
          {getInitials(user)}
        </Avatar>
      </IconButton>
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Esci
        </MenuItem>
      </Menu>
    </>
  )
}
