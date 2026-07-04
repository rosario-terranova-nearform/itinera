import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import {
  ACCEPTED_SIGNED_SHEET_TYPES,
  formatSignedSheetFileSize,
  MAX_SIGNED_SHEET_BYTES,
} from '@/utils/signedSheetUpload'

function rejectionMessage(rejections: FileRejection[]): string {
  const error = rejections[0]?.errors[0]
  if (!error) return 'File non valido.'
  if (error.code === 'file-too-large') {
    return `Il file supera la dimensione massima di ${formatSignedSheetFileSize(MAX_SIGNED_SHEET_BYTES)}.`
  }
  if (error.code === 'file-invalid-type') {
    return 'Formato non supportato. Usa JPEG, PNG, WebP o PDF.'
  }
  return error.message
}

interface FileUploadZoneProps {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
  isUploading?: boolean
  uploadProgress?: number | null
  error?: string | null
}

export default function FileUploadZone({
  file,
  onFileChange,
  disabled = false,
  isUploading = false,
  uploadProgress = null,
  error = null,
}: FileUploadZoneProps) {
  const [localError, setLocalError] = useState<string | null>(null)

  const previewUrl = useMemo(() => {
    if (!file?.type.startsWith('image/')) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setLocalError(null)
      if (rejections.length > 0) {
        setLocalError(rejectionMessage(rejections))
        return
      }
      onFileChange(accepted[0] ?? null)
    },
    [onFileChange],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_SIGNED_SHEET_TYPES,
    maxSize: MAX_SIGNED_SHEET_BYTES,
    maxFiles: 1,
    multiple: false,
    disabled: disabled || isUploading,
    noClick: !!file,
    noKeyboard: !!file,
  })

  const displayError = error ?? localError
  const isPdf = file?.type === 'application/pdf'

  const progressValue = useMemo(() => {
    if (uploadProgress !== null) return uploadProgress
    return isUploading ? undefined : 0
  }, [isUploading, uploadProgress])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        {...getRootProps()}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: displayError ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
          borderRadius: 2,
          bgcolor: isDragActive ? 'action.hover' : 'background.default',
          p: 3,
          textAlign: 'center',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          opacity: disabled || isUploading ? 0.6 : 1,
          transition: 'border-color 0.2s, background-color 0.2s',
        }}
      >
        <input {...getInputProps()} />

        {file ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt={file.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: 160,
                  borderRadius: 1,
                  objectFit: 'contain',
                  border: 1,
                  borderColor: 'divider',
                }}
              />
            ) : isPdf ? (
              <PictureAsPdfOutlinedIcon sx={{ fontSize: 64, color: 'error.main' }} />
            ) : (
              <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
            )}

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatSignedSheetFileSize(file.size)}
              </Typography>
            </Box>

            {!isUploading ? (
              <IconButton
                size="small"
                aria-label="Rimuovi file"
                onClick={(event) => {
                  event.stopPropagation()
                  onFileChange(null)
                  setLocalError(null)
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {isDragActive ? 'Rilascia il file qui' : 'Trascina il foglio firma oppure clicca per selezionare'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              JPEG, PNG, WebP o PDF · max {formatSignedSheetFileSize(MAX_SIGNED_SHEET_BYTES)}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
              onClick={(event) => {
                event.stopPropagation()
                open()
              }}
              disabled={disabled || isUploading}
            >
              Sfoglia file
            </Button>
          </Box>
        )}
      </Box>

      {isUploading ? (
        <Box>
          <LinearProgress
            variant={progressValue === undefined ? 'indeterminate' : 'determinate'}
            value={progressValue}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Caricamento in corso…
          </Typography>
        </Box>
      ) : null}

      {displayError ? (
        <Typography variant="body2" color="error">
          {displayError}
        </Typography>
      ) : null}
    </Box>
  )
}
