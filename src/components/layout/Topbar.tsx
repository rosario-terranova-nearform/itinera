import { useLocation } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { getPageTitle } from '@/utils/pageTitles'
import UserMenu from './UserMenu'

interface TopbarProps {
  title?: string
}

export default function Topbar({ title }: TopbarProps) {
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
          minHeight: 64,
          px: 3,
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          noWrap
          sx={{ fontWeight: 600, minWidth: 0, m: 0 }}
        >
          {pageTitle}
        </Typography>
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
