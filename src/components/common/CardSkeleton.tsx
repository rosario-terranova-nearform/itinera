import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

interface CardSkeletonProps {
  count?: number
}

export default function CardSkeleton({ count = 3 }: CardSkeletonProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} sx={{ flex: '1 1 140px', minWidth: 120 }}>
          <CardContent>
            <Skeleton variant="rounded" width={80} height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton variant="text" width="60%" />
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
