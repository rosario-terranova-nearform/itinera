import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'

interface CalendarSkeletonProps {
  height?: string | number
}

export default function CalendarSkeleton({ height = 'calc(100vh - 320px)' }: CalendarSkeletonProps) {
  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Skeleton variant="rounded" width={200} height={36} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={36} height={36} />
          <Skeleton variant="rounded" width={36} height={36} />
          <Skeleton variant="rounded" width={80} height={36} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" sx={{ flex: 1 }} height={24} />
        ))}
      </Box>
      <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 300 }} />
    </Box>
  )
}
