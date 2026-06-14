import { useMemo } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha } from '@mui/material/styles'
import DashboardIcon from '@mui/icons-material/Dashboard'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BusinessIcon from '@mui/icons-material/Business'
import DescriptionIcon from '@mui/icons-material/Description'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import Topbar from './Topbar'

export const SIDEBAR_WIDTH = 240
export const BOTTOM_NAV_HEIGHT = 56

interface NavItem {
  label: string
  path: string
  icon: typeof DashboardIcon
  matchPrefixes?: string[]
}

const sidebarNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/rep', icon: DashboardIcon, matchPrefixes: ['/rep'] },
  {
    label: 'Pianificazione',
    path: '/rep/calendar',
    icon: CalendarMonthIcon,
    matchPrefixes: ['/rep/calendar', '/rep/appointments'],
  },
  { label: 'Aziende', path: '/rep/companies', icon: BusinessIcon },
  { label: 'Documenti', path: '/rep/documents', icon: DescriptionIcon },
  { label: 'Impostazioni', path: '/rep/settings', icon: SettingsIcon },
]

const bottomNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/rep', icon: DashboardIcon, matchPrefixes: ['/rep'] },
  { label: 'Calendario', path: '/rep/calendar', icon: CalendarMonthIcon },
  { label: 'Profilo', path: '/rep/profile', icon: PersonIcon },
]

function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.matchPrefixes) {
    return item.matchPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  }
  return pathname === item.path || pathname.startsWith(`${item.path}/`)
}

function RepSidebar() {
  const location = useLocation()

  return (
    <Box
      component="nav"
      aria-label="Navigazione rappresentante"
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
          Area Rappresentante
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1.5, py: 1.5 }}>
        {sidebarNavItems.map((item) => {
          const active = isNavActive(location.pathname, item)

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={!item.matchPrefixes?.length}
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
                <item.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
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

export default function RepLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const location = useLocation()

  const activeTab = useMemo(
    () => bottomNavItems.findIndex((item) => isNavActive(location.pathname, item)),
    [location.pathname],
  )

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          <RepSidebar />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pb: isDesktop ? 0 : `${BOTTOM_NAV_HEIGHT}px`,
        }}
      >
        <Topbar />
        <Outlet />
      </Box>

      {!isDesktop && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: 1,
            borderColor: 'divider',
          }}
          elevation={0}
        >
          <BottomNavigation
            value={activeTab === -1 ? 0 : activeTab}
            showLabels
            sx={{
              height: BOTTOM_NAV_HEIGHT,
              bgcolor: 'background.paper',
            }}
          >
            {bottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                component={NavLink}
                to={item.path}
                label={item.label}
                icon={<item.icon />}
                sx={{
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  )
}
