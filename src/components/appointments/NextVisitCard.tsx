import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import NavigationIcon from '@mui/icons-material/Navigation'
import { buildCompanyFullAddress, buildMapsUrl, getCompanyName } from '@/api/appointments'
import StatusChip from '@/components/common/StatusChip'
import { statusColors } from '@/theme/muiTheme'
import type { AppointmentRecord } from '@/types'
import { formatCountdown, formatTimeRange } from '@/utils/dateUtils'

interface NextVisitCardProps {
  appointment: AppointmentRecord
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.5, fontWeight: 600, letterSpacing: '0.06em' }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function NextVisitCard({ appointment }: NextVisitCardProps) {
  const company = appointment.expand?.company
  const address = buildCompanyFullAddress(company)
  const contact = company?.contact_person || '—'
  const mapsUrl = address ? buildMapsUrl(address) : undefined
  const canReschedule =
    appointment.status === 'pending' || appointment.status === 'confirmed'

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: 4,
        borderLeftColor: statusColors[appointment.status],
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            mb: 2,
          }}
        >
          <StatusChip status={appointment.status} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {formatCountdown(appointment.scheduled_datetime)}
          </Typography>
        </Box>

        <Typography variant="h3" sx={{ mb: 1 }}>
          {getCompanyName(appointment)}
        </Typography>

        {address ? (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 2.5 }}>
            <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
            <Typography variant="body2" color="text.secondary">
              {address}
            </Typography>
          </Box>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
          <DetailField
            label="Orario"
            value={formatTimeRange(appointment.scheduled_datetime, appointment.end_datetime)}
          />
          <DetailField label="Contatto" value={contact} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap' }}>
          {canReschedule ? (
            <Button
              component={RouterLink}
              to={`/rep/appointments/${appointment.id}/reschedule`}
              variant="outlined"
              color="inherit"
            >
              Riprogramma
            </Button>
          ) : null}
          {mapsUrl ? (
            <Button
              component="a"
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              startIcon={<NavigationIcon />}
            >
              Avvia navigazione
            </Button>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  )
}
