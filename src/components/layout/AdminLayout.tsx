import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { Outlet } from 'react-router-dom'
import AdminSidebar, { SIDEBAR_WIDTH } from './AdminSidebar'
import Topbar from './Topbar'

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
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
        <AdminSidebar />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Topbar />
        <Outlet />
      </Box>
    </Box>
  )
}
