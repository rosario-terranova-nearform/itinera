import { useNavigate } from 'react-router-dom'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import StatusChip from '@/components/common/StatusChip'
import type { AppointmentRecord } from '@/types'
import { getCompanyName, getRepresentativeName } from '@/api/appointments'
import { formatDateTime } from '@/utils/dateUtils'

interface AppointmentDrawerProps {
  appointment: AppointmentRecord | null
  open: boolean
  onClose: () => void
  detailPathPrefix?: string
}

export default function AppointmentDrawer({
  appointment,
  open,
  onClose,
  detailPathPrefix = '/admin/appointments',
}: AppointmentDrawerProps) {
  const navigate = useNavigate()

  if (!appointment) return null

  const company = appointment.expand?.company

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 380 },
        },
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              {appointment.reference_code}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {getCompanyName(appointment)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Chiudi">
            <CloseIcon />
          </IconButton>
        </Box>

        <StatusChip status={appointment.status} />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Data e ora
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatDateTime(appointment.scheduled_datetime)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Rappresentante
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {getRepresentativeName(appointment)}
            </Typography>
          </Box>
          {company?.address || company?.city ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Indirizzo
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {[company.address, company.city, company.province].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          ) : null}
          {appointment.notes ? (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Note
              </Typography>
              <Typography variant="body2">{appointment.notes}</Typography>
            </Box>
          ) : null}
        </Box>

        <Button
          variant="contained"
          fullWidth
          endIcon={<OpenInNewIcon />}
          onClick={() => {
            onClose()
            navigate(`${detailPathPrefix}/${appointment.id}`)
          }}
          sx={{ mt: 2 }}
        >
          Vai al dettaglio
        </Button>
      </Box>
    </Drawer>
  )
}
