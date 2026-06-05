import { alpha, createTheme } from '@mui/material/styles'

/** Status hex from `.agents/design/DESIGN.md` */
export const statusColors = {
  pending: '#ED6C02',
  confirmed: '#2E7D32',
  completed: '#1976D2',
  cancelled: '#D32F2F',
} as const

/** Chip background opacity per design spec (10–15%) */
export const statusChipBackgroundOpacity = 0.12

const chipStatusStyle = (color: string) => ({
  backgroundColor: alpha(color, statusChipBackgroundOpacity),
  color,
  fontWeight: 600,
  border: 'none',
})

declare module '@mui/material/styles' {
  interface Palette {
    status: typeof statusColors
  }
  interface PaletteOptions {
    status?: Partial<typeof statusColors>
  }
}

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#005dac',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#515f74',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ba1a1a',
      contrastText: '#ffffff',
    },
    warning: {
      main: statusColors.pending,
      contrastText: '#ffffff',
    },
    success: {
      main: statusColors.confirmed,
      contrastText: '#ffffff',
    },
    info: {
      main: statusColors.completed,
      contrastText: '#ffffff',
    },
    background: {
      default: '#f7f9fb',
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
    status: statusColors,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: '2.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      lineHeight: '2rem',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: '1.75rem',
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: '1rem',
      letterSpacing: '0.01em',
    },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 500,
      lineHeight: '0.875rem',
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f7f9fb',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
        },
        colorWarning: chipStatusStyle(statusColors.pending),
        colorSuccess: chipStatusStyle(statusColors.confirmed),
        colorPrimary: chipStatusStyle(statusColors.completed),
        colorError: chipStatusStyle(statusColors.cancelled),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#717783',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#005dac',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation2: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
        elevation8: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
})
