// pb_hooks/defaults.pb.js — set field defaults on create when not explicitly provided
// Note: logic must be inlined — JSVM handlers cannot call module-level functions.

onRecordCreateRequest((e) => {
  let data = {}
  try {
    const info = typeof e.requestInfo === 'function' ? e.requestInfo() : e.requestInfo
    data = info?.body || {}
  } catch (_) {}

  if (!('is_active' in data)) {
    e.record.set('is_active', true)
  }
  if (!data.role) {
    e.record.set('role', 'representative')
  }

  e.next()
}, 'users')

onRecordCreateRequest((e) => {
  let data = {}
  try {
    const info = typeof e.requestInfo === 'function' ? e.requestInfo() : e.requestInfo
    data = info?.body || {}
  } catch (_) {}

  if (!data.status) {
    e.record.set('status', 'pending')
  }

  e.next()
}, 'appointments')

onRecordCreateRequest((e) => {
  let data = {}
  try {
    const info = typeof e.requestInfo === 'function' ? e.requestInfo() : e.requestInfo
    data = info?.body || {}
  } catch (_) {}

  if (!('is_active' in data)) {
    e.record.set('is_active', true)
  }

  e.next()
}, 'companies')

onRecordCreateRequest((e) => {
  let data = {}
  try {
    const info = typeof e.requestInfo === 'function' ? e.requestInfo() : e.requestInfo
    data = info?.body || {}
  } catch (_) {}

  if (!('is_read' in data)) {
    e.record.set('is_read', false)
  }

  e.next()
}, 'notifications')

onRecordCreateRequest((e) => {
  let data = {}
  try {
    const info = typeof e.requestInfo === 'function' ? e.requestInfo() : e.requestInfo
    data = info?.body || {}
  } catch (_) {}

  if (!('viewed_by_admin' in data)) {
    e.record.set('viewed_by_admin', false)
  }

  e.next()
}, 'signed_sheets')
