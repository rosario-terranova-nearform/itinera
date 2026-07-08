import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { getPageTitle } from '@/utils/pageTitles'
import UserMenu from './UserMenu'

interface TopbarProps {
  title?: string
  startAdornment?: ReactNode
}

export default function Topbar({ title, startAdornment }: TopbarProps) {
  const location = useLocation()
  const pageTitle = title ?? getPageTitle(location.pathname)

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        width: '100%',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: { xs: 56, md: 64 },
          px: { xs: 2, md: 3 },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
          {startAdornment}
          <Typography
            variant="h3"
            component="h1"
            noWrap
            sx={{
              fontWeight: 600,
              minWidth: 0,
              m: 0,
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
            }}
          >
            {pageTitle}
          </Typography>
        </Box>
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
