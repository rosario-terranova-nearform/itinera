import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import pb from '@/lib/pocketbase'
import { useAuthStore } from '@/store/authStore'
import type { UserRecord, UserRole } from '@/types'
import { getDisplayName } from '@/types'

function getInitials(user: Pick<UserRecord, 'first_name' | 'last_name'>): string {
  const first = user.first_name?.charAt(0) ?? ''
  const last = user.last_name?.charAt(0) ?? ''
  return (first + last).toUpperCase() || '?'
}

function getAvatarUrl(user: UserRecord): string | undefined {
  if (!user.avatar) return undefined
  return pb.files.getUrl(user, user.avatar)
}

function getProfilePath(role: UserRole): string {
  return role === 'admin' ? '/admin/settings' : '/rep/profile'
}

export default function UserMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.authModel)
  const logout = useAuthStore((s) => s.logout)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  if (!user) return null

  const handleClose = () => setAnchorEl(null)

  const handleProfile = () => {
    setAnchorEl(null)
    navigate(getProfilePath(user.role))
  }

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
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 200, mt: 0.5 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {getDisplayName(user)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {user.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profilo
        </MenuItem>

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
