import Chip from '@mui/material/Chip'
import type { AppointmentStatus } from '@/types'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'In attesa',
  confirmed: 'Confermato',
  completed: 'Completato',
  cancelled: 'Annullato',
}

const STATUS_COLORS: Record<
  AppointmentStatus,
  'warning' | 'success' | 'primary' | 'error'
> = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'primary',
  cancelled: 'error',
}

interface StatusChipProps {
  status: AppointmentStatus
  size?: 'small' | 'medium'
}

export default function StatusChip({ status, size = 'small' }: StatusChipProps) {
  return (
    <Chip
      label={STATUS_LABELS[status]}
      size={size}
      color={STATUS_COLORS[status]}
      variant="outlined"
    />
  )
}

export { STATUS_LABELS }
