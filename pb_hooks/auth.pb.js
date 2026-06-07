// pb_hooks/auth.pb.js — blocks login if is_active = false

onRecordAuthWithPasswordRequest((e) => {
  if (!e.record.getBool('is_active')) {
    throw new ApiError(403, "Account disattivato. Contatta l'amministratore.")
  }
}, 'users')
