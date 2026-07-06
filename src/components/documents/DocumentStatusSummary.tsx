import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

interface SummaryItem {
  label: string
  value: number
  color: string
}

interface DocumentStatusSummaryProps {
  items: SummaryItem[]
}

export default function DocumentStatusSummary({ items }: DocumentStatusSummaryProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
      {items.map((item) => (
        <Card key={item.label} sx={{ flex: 1, minWidth: 160 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                bgcolor: `${item.color}1A`,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.125rem',
              }}
            >
              {item.value}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {item.value}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
