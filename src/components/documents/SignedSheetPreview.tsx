import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import DownloadIcon from '@mui/icons-material/Download'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import {
  getFileUrl,
  isImageMimeType,
  isPdfMimeType,
} from '@/api/signedSheets'
import { useMarkAsViewedMutation } from '@/hooks/useSignedSheets'
import type { SignedSheetRecord } from '@/types'

interface SignedSheetPreviewProps {
  sheet: SignedSheetRecord
  trackView?: boolean
  onViewed?: (sheet: SignedSheetRecord) => void
}

export default function SignedSheetPreview({
  sheet,
  trackView = false,
  onViewed,
}: SignedSheetPreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const markViewedMutation = useMarkAsViewedMutation()

  useEffect(() => {
    let cancelled = false

    void getFileUrl(sheet)
      .then((url) => {
        if (!cancelled) setFileUrl(url)
      })
      .catch(() => {
        if (!cancelled) setLoadError('Impossibile caricare l\'anteprima del documento.')
      })

    return () => {
      cancelled = true
    }
  }, [sheet])

  const handleOpen = async () => {
    if (!fileUrl) return

    setIsOpening(true)
    try {
      if (trackView && !sheet.viewed_by_admin) {
        const updated = await markViewedMutation.mutateAsync(sheet.id)
        onViewed?.(updated)
      }
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
    } catch {
      setLoadError('Errore nell\'apertura del documento.')
    } finally {
      setIsOpening(false)
    }
  }

  const handleDownload = async () => {
    if (!fileUrl) return

    try {
      const anchor = document.createElement('a')
      anchor.href = fileUrl
      anchor.download = sheet.file_name
      anchor.rel = 'noopener'
      anchor.click()
    } catch {
      setLoadError('Errore nel download del documento.')
    }
  }

  const isImage = isImageMimeType(sheet.mime_type)
  const isPdf = isPdfMimeType(sheet.mime_type)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 1,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {!fileUrl && !loadError ? (
            <CircularProgress size={28} />
          ) : isImage && fileUrl ? (
            <Box
              component="img"
              src={fileUrl}
              alt={sheet.file_name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : isPdf ? (
            <PictureAsPdfOutlinedIcon sx={{ fontSize: 40, color: 'error.main' }} />
          ) : (
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          )}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {sheet.file_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {sheet.mime_type}
          </Typography>
        </Box>
      </Box>

      {loadError ? <Alert severity="error">{loadError}</Alert> : null}

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<OpenInNewIcon />}
          disabled={!fileUrl || isOpening || markViewedMutation.isPending}
          onClick={() => void handleOpen()}
        >
          Apri
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={!fileUrl}
          onClick={() => void handleDownload()}
        >
          Scarica
        </Button>
      </Box>
    </Box>
  )
}
