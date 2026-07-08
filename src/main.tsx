import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'dayjs/locale/it'
import 'react-toastify/dist/ReactToastify.css'

import App from '@/App'
import { muiTheme } from '@/theme/muiTheme'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CssBaseline />
            <App />
            <ToastContainer theme="colored" />
          </BrowserRouter>
        </QueryClientProvider>
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
)
