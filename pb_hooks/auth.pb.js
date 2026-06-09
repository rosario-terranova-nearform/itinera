// pb_hooks/auth.pb.js — blocks login and token refresh if is_active = false
// Note: logic must be inlined — JSVM handlers cannot call module-level functions.

onRecordAuthWithPasswordRequest((e) => {
  if (e.record && e.record.get('is_active') === false) {
    throw new ApiError(403, "Account disattivato. Contatta l'amministratore.")
  }
  e.next()
}, 'users')

onRecordAuthRefreshRequest((e) => {
  if (e.record && e.record.get('is_active') === false) {
    throw new ApiError(403, "Account disattivato. Contatta l'amministratore.")
  }
  e.next()
}, 'users')
