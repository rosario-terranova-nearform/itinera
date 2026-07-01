import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PersonIcon from '@mui/icons-material/Person'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import { formatCompanyAddress } from '@/api/companies'
import type { CompanyRecord } from '@/types'

const AVATAR_PALETTE = [
  { bg: '#E3F2FD', color: '#1565C0' },
  { bg: '#ECEFF1', color: '#455A64' },
  { bg: '#F3E5F5', color: '#7B1FA2' },
  { bg: '#FCE4EC', color: '#C2185B' },
  { bg: '#E8F5E9', color: '#2E7D32' },
  { bg: '#FFF3E0', color: '#EF6C00' },
] as const

function getCompanyInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}

function getAvatarPalette(name: string) {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

interface CompanyDirectoryCardProps {
  company: CompanyRecord
}

export default function CompanyDirectoryCard({ company }: CompanyDirectoryCardProps) {
  const address = formatCompanyAddress(company)
  const avatar = getAvatarPalette(company.name)
  const contactLabel = [company.contact_person, company.contact_title ? `(${company.contact_title})` : '']
    .filter(Boolean)
    .join(' ')

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: avatar.bg,
              color: avatar.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              flexShrink: 0,
            }}
          >
            {getCompanyInitials(company.name)}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.75 }}>
              {company.name}
            </Typography>
            {company.segment ? (
              <Chip label={company.segment} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
            ) : null}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {address ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.15 }} />
              <Typography variant="body2" color="text.secondary">
                {address}
              </Typography>
            </Box>
          ) : null}

          {contactLabel ? (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.15 }} />
              <Typography variant="body2" color="text.secondary">
                {contactLabel}
              </Typography>
            </Box>
          ) : null}

          {company.phone ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {company.phone}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  )
}
