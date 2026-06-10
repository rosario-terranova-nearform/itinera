import { NavLink, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
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
  matchPrefixes?: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: DashboardIcon, exact: true },
  {
    label: 'Pianificazione',
    path: '/admin/calendar',
    icon: CalendarMonthIcon,
    matchPrefixes: ['/admin/calendar', '/admin/appointments'],
  },
  { label: 'Aziende', path: '/admin/companies', icon: BusinessIcon },
  { label: 'Rappresentanti', path: '/admin/representatives', icon: PeopleIcon },
  { label: 'Documenti', path: '/admin/documents', icon: DescriptionIcon },
  { label: 'Impostazioni', path: '/admin/settings', icon: SettingsIcon },
]

function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.matchPrefixes) {
    return item.matchPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  }
  if (item.exact) return pathname === item.path
  return pathname === item.path || pathname.startsWith(`${item.path}/`)
}

export default function AdminSidebar() {
  const location = useLocation()

  return (
    <Box
      component="nav"
      aria-label="Navigazione admin"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1.25 }}
        >
          Itinera
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          Admin Management Portal
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
        {navItems.map((item) => {
          const { label, path, icon: Icon, exact } = item
          const active = isNavActive(location.pathname, item)

          return (
            <ListItemButton
              key={path}
              component={NavLink}
              to={path}
              end={exact}
              selected={active}
              aria-current={active ? 'page' : undefined}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                py: 1,
                color: active ? 'primary.main' : 'text.primary',
                borderLeft: 3,
                borderColor: active ? 'primary.main' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                  },
                },
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      lineHeight: '1.25rem',
                    },
                  },
                }}
              />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )
}

export { SIDEBAR_WIDTH }
