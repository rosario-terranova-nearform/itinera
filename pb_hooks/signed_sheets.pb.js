// pb_hooks/signed_sheets.pb.js — secure upload validation (T12.12)
// Note: logic must be inlined — JSVM handlers cannot use module-level helpers.

onRecordCreateRequest((e) => {
  if (e.hasSuperuserAuth()) {
    e.next()
    return
  }

  const auth = e.auth
  if (!auth || auth.get('role') !== 'representative') {
    throw new ApiError(403, 'Solo i rappresentanti possono caricare fogli firma.')
  }

  let data = {}
  try {
    const info = typeof e.requestInfo === 'function' ? e.requestInfo() : e.requestInfo
    data = info?.body || {}
  } catch (_) {}

  const uploadedBy = String(e.record.get('uploaded_by') || data.uploaded_by || '')
  if (uploadedBy !== String(auth.id)) {
    throw new ApiError(403, "uploaded_by deve corrispondere all'utente autenticato.")
  }

  const mimeType = String(e.record.get('mime_type') || data.mime_type || '')
  if (
    mimeType !== 'image/jpeg' &&
    mimeType !== 'image/png' &&
    mimeType !== 'image/webp' &&
    mimeType !== 'application/pdf'
  ) {
    throw new ApiError(400, 'Formato file non supportato.')
  }

  const fileSize = Number(e.record.get('file_size') || data.file_size || 0)
  if (!fileSize || fileSize > 10485760) {
    throw new ApiError(400, 'Il file supera la dimensione massima di 10 MB.')
  }

  const appointmentId = String(e.record.get('appointment') || data.appointment || '')
  if (!appointmentId) {
    throw new ApiError(400, 'Appuntamento obbligatorio.')
  }

  let appointment
  try {
    appointment = $app.findRecordById('appointments', appointmentId)
  } catch (_) {
    throw new ApiError(400, 'Appuntamento non trovato.')
  }

  if (appointment.get('representative') !== auth.id) {
    throw new ApiError(403, 'Non autorizzato a caricare documenti per questo appuntamento.')
  }

  if (appointment.get('status') !== 'confirmed') {
    throw new ApiError(400, 'Il foglio firma può essere caricato solo per visite confermate.')
  }

  e.next()
}, 'signed_sheets')
