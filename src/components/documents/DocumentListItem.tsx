import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import DownloadIcon from '@mui/icons-material/Download'
import { getFileUrl } from '@/api/signedSheets'
import {
  getRepSheetStatusColor,
  getRepSheetStatusLabel,
} from '@/hooks/useSignedSheets'
import { formatDateTime } from '@/utils/dateUtils'
import type { SignedSheetRecord } from '@/types'

interface DocumentListItemProps {
  sheet: SignedSheetRecord
  subtitle?: string
  onDetail?: () => void
  detailLabel?: string
}

export default function DocumentListItem({
  sheet,
  subtitle,
  onDetail,
  detailLabel = 'Dettaglio',
}: DocumentListItemProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const url = await getFileUrl(sheet)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = sheet.file_name
      anchor.rel = 'noopener'
      anchor.click()
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: 1.5,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {sheet.file_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subtitle ?? `Caricato il ${formatDateTime(sheet.created)}`}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Chip
          size="small"
          label={getRepSheetStatusLabel(sheet)}
          color={getRepSheetStatusColor(sheet)}
          variant="outlined"
        />
        <Button
          size="small"
          startIcon={<DownloadIcon />}
          disabled={isDownloading}
          onClick={() => void handleDownload()}
        >
          Scarica
        </Button>
        {onDetail ? (
          <Button size="small" onClick={onDetail}>
            {detailLabel}
          </Button>
        ) : null}
      </Box>
    </Box>
  )
}
