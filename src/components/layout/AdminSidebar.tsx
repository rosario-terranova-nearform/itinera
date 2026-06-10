import { useLocation, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import DashboardIcon from '@mui/icons-material/Dashboard'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BusinessIcon from '@mui/icons-material/Business'
import PeopleIcon from '@mui/icons-material/People'
import DescriptionIcon from '@mui/icons-material/Description'
import SettingsIcon from '@mui/icons-material/Settings'

const SIDEBAR_WIDTH = 240

interface NavItem {
  label: string
  path: string
  icon: typeof DashboardIcon
  exact?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: DashboardIcon, exact: true },
  { label: 'Pianificazione', path: '/admin/calendar', icon: CalendarMonthIcon },
  { label: 'Aziende', path: '/admin/companies', icon: BusinessIcon },
  { label: 'Rappresentanti', path: '/admin/representatives', icon: PeopleIcon },
  { label: 'Documenti', path: '/admin/documents', icon: DescriptionIcon },
  { label: 'Impostazioni', path: '/admin/settings', icon: SettingsIcon },
]

function isActive(pathname: string, path: string, exact?: boolean) {
  if (exact) return pathname === path
  return pathname === path || pathname.startsWith(`${path}/`)
}

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Itinera
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Admin Management Portal
        </Typography>
      </Box>

      <List sx={{ flex: 1, px: 1 }}>
        {navItems.map(({ label, path, icon: Icon, exact }) => {
          const active = isActive(location.pathname, path, exact)
          return (
            <ListItemButton
              key={path}
              selected={active}
              onClick={() => navigate(path)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: (theme) => theme.palette.primary.main + '14',
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.primary.main + '1F',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? 'primary.main' : 'inherit' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {label}
                  </Typography>
                }
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}

export { SIDEBAR_WIDTH }
