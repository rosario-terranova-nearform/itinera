import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import EventIcon from '@mui/icons-material/Event'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import type { AppointmentModificationRecord, AppointmentRecord } from '@/types'
import { getDisplayName } from '@/types'
import { formatDateTime } from '@/utils/dateUtils'
import { statusColors } from '@/theme/muiTheme'

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  color: string
  icon: 'create' | 'edit' | 'confirm' | 'upload'
}

function getIcon(icon: TimelineEvent['icon']) {
  switch (icon) {
    case 'create':
      return <AddCircleOutlinedIcon sx={{ fontSize: 18 }} />
    case 'edit':
      return <EditIcon sx={{ fontSize: 18 }} />
    case 'confirm':
      return <CheckCircleIcon sx={{ fontSize: 18 }} />
    case 'upload':
      return <UploadFileIcon sx={{ fontSize: 18 }} />
    default:
      return <EventIcon sx={{ fontSize: 18 }} />
  }
}

interface AppointmentTimelineProps {
  appointment: AppointmentRecord
  modifications: AppointmentModificationRecord[]
  hasSignedSheet?: boolean
}

export default function AppointmentTimeline({
  appointment,
  modifications,
  hasSignedSheet = false,
}: AppointmentTimelineProps) {
  const events: TimelineEvent[] = [
    {
      id: 'created',
      date: appointment.created,
      title: 'Appuntamento creato',
      description: appointment.expand?.created_by
        ? `Creato da ${getDisplayName(appointment.expand.created_by)}`
        : 'Creato dall\'Unità Centrale',
      color: statusColors.completed,
      icon: 'create',
    },
  ]

  for (const mod of modifications) {
    events.push({
      id: mod.id,
      date: mod.created,
      title: 'Data/ora modificata',
      description: [
        `${formatDateTime(mod.old_datetime)} → ${formatDateTime(mod.new_datetime)}`,
        mod.expand?.modified_by ? `da ${getDisplayName(mod.expand.modified_by)}` : '',
        mod.reason ? `Motivo: ${mod.reason}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
      color: statusColors.pending,
      icon: 'edit',
    })
  }

  if (appointment.status === 'confirmed' || appointment.status === 'completed') {
    const lastMod = modifications.at(-1)
    const confirmDate = lastMod?.created ?? appointment.updated
    events.push({
      id: 'confirmed',
      date: confirmDate,
      title: 'Visita confermata',
      description: `Confermato per il ${formatDateTime(appointment.scheduled_datetime)}`,
      color: statusColors.confirmed,
      icon: 'confirm',
    })
  }

  if (hasSignedSheet || appointment.status === 'completed') {
    events.push({
      id: 'upload',
      date: appointment.updated,
      title: 'Foglio firma caricato',
      description: 'Documento di prova visita ricevuto',
      color: statusColors.completed,
      icon: 'upload',
    })
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nessun evento registrato.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {sorted.map((event, index) => (
        <Box key={event.id} sx={{ display: 'flex', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 32,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: 2,
                borderColor: event.color,
                color: event.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
              }}
            >
              {getIcon(event.icon)}
            </Box>
            {index < sorted.length - 1 ? (
              <Box sx={{ width: 2, flex: 1, minHeight: 24, bgcolor: 'divider', my: 0.5 }} />
            ) : null}
          </Box>
          <Box sx={{ pb: index < sorted.length - 1 ? 2.5 : 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {event.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {formatDateTime(event.date)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {event.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
