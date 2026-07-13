// pb_hooks/appointments.pb.js — defense in depth for rep access and state machine (§6)
// Note: logic must be inlined — JSVM handlers cannot call module-level functions.

onRecordEnrich((e) => {
  const auth = e.requestInfo?.auth
  if (auth && auth.get('role') === 'representative') {
    e.record.hide('internal_notes')
  }
  e.next()
}, 'appointments')

onRecordUpdateRequest((e) => {
  if (e.hasSuperuserAuth()) {
    e.next()
    return
  }

  const auth = e.auth
  if (!auth) {
    throw new ApiError(403, 'Autenticazione richiesta.')
  }

  const role = auth.get('role')
  const original = $app.findRecordById('appointments', e.record.id)
  const oldStatus = original.get('status')
  const newStatus = e.record.get('status')

  if (role === 'representative') {
    if (original.get('representative') !== auth.id) {
      throw new ApiError(403, 'Non autorizzato a modificare questo appuntamento.')
    }

    if (oldStatus === 'cancelled' || oldStatus === 'completed') {
      throw new ApiError(400, 'Questo appuntamento non può essere modificato.')
    }

    const blockedFields = ['company', 'representative', 'created_by', 'internal_notes']
    for (let i = 0; i < blockedFields.length; i++) {
      const field = blockedFields[i]
      if (e.record.get(field) !== original.get(field)) {
        throw new ApiError(403, 'Non autorizzato a modificare il campo: ' + field)
      }
    }

    if (oldStatus === 'confirmed' && newStatus === 'completed') {
      try {
        $app.findFirstRecordByFilter(
          'signed_sheets',
          'appointment = {:appointmentId}',
          { appointmentId: e.record.id },
        )
      } catch (_) {
        throw new ApiError(400, 'Carica il foglio firma prima di completare la visita.')
      }
      e.next()
      return
    }

    if (newStatus === 'cancelled' || newStatus === 'completed' || newStatus === 'pending') {
      throw new ApiError(400, 'Transizione di stato non consentita.')
    }

    if (oldStatus === 'pending' && newStatus !== 'confirmed') {
      throw new ApiError(400, 'Transizione di stato non consentita.')
    }

    if (oldStatus === 'confirmed' && newStatus !== 'confirmed') {
      throw new ApiError(400, 'Transizione di stato non consentita.')
    }
  }

  if (role === 'admin') {
    if (oldStatus === 'completed' || oldStatus === 'cancelled') {
      const statusChanged = newStatus !== oldStatus
      const companyChanged = e.record.get('company') !== original.get('company')
      const repChanged = e.record.get('representative') !== original.get('representative')
      const datetimeChanged =
        e.record.get('scheduled_datetime') !== original.get('scheduled_datetime')

      if (statusChanged || companyChanged || repChanged || datetimeChanged) {
        throw new ApiError(
          400,
          'Gli appuntamenti completati o annullati non possono essere modificati.',
        )
      }
    }
  }

  e.next()
}, 'appointments')
