import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import PersonIcon from '@mui/icons-material/Person'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import NavigationIcon from '@mui/icons-material/Navigation'
import {
  buildCompanyFullAddress,
  buildMapsUrl,
  getCompanyName,
} from '@/api/appointments'
import type { AppointmentRecord } from '@/types'
import { formatVisitSchedule } from '@/utils/dateUtils'

interface VisitInfoCardProps {
  appointment: AppointmentRecord
  showDirections?: boolean
}

export default function VisitInfoCard({
  appointment,
  showDirections = true,
}: VisitInfoCardProps) {
  const company = appointment.expand?.company
  const address = buildCompanyFullAddress(company)
  const mapsUrl = address ? buildMapsUrl(address) : undefined
  const contactLabel = [company?.contact_person, company?.contact_title]
    .filter(Boolean)
    .join(' · ')

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 2, fontWeight: 600 }}
        >
          Informazioni visita
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.15 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Data e ora
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatVisitSchedule(
                  appointment.scheduled_datetime,
                  appointment.end_datetime || undefined,
                )}
              </Typography>
            </Box>
          </Box>

          {contactLabel ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <PersonIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.15 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Referente
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {contactLabel}
                </Typography>
              </Box>
            </Box>
          ) : null}

          {company?.phone ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <PhoneOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography
                component="a"
                href={`tel:${company.phone}`}
                variant="body1"
                sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none' }}
              >
                {company.phone}
              </Typography>
            </Box>
          ) : null}

          {address ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.15 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Indirizzo
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {address}
                </Typography>
                {showDirections && mapsUrl ? (
                  <Button
                    component="a"
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<NavigationIcon />}
                    sx={{ mt: 1 }}
                  >
                    Indicazioni
                  </Button>
                ) : null}
              </Box>
            </Box>
          ) : null}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          {getCompanyName(appointment)}
        </Typography>
      </CardContent>
    </Card>
  )
}
