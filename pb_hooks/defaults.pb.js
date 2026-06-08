// pb_hooks/defaults.pb.js — set field defaults on create when not explicitly provided

function getRequestData(httpContext) {
  try {
    return $apis.requestInfo(httpContext).data || {}
  } catch (_) {
    return {}
  }
}

onRecordCreateRequest((e) => {
  const data = getRequestData(e.httpContext)

  if (!('is_active' in data)) {
    e.record.set('is_active', true)
  }
  if (!data.role) {
    e.record.set('role', 'representative')
  }

  e.next()
}, 'users')

onRecordCreateRequest((e) => {
  const data = getRequestData(e.httpContext)

  if (!data.status) {
    e.record.set('status', 'pending')
  }

  e.next()
}, 'appointments')

onRecordCreateRequest((e) => {
  const data = getRequestData(e.httpContext)

  if (!('is_active' in data)) {
    e.record.set('is_active', true)
  }

  e.next()
}, 'companies')

onRecordCreateRequest((e) => {
  const data = getRequestData(e.httpContext)

  if (!('is_read' in data)) {
    e.record.set('is_read', false)
  }

  e.next()
}, 'notifications')

onRecordCreateRequest((e) => {
  const data = getRequestData(e.httpContext)

  if (!('viewed_by_admin' in data)) {
    e.record.set('viewed_by_admin', false)
  }

  e.next()
}, 'signed_sheets')
