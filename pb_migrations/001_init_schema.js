/// <reference path="../pb_data/types.pb.d.ts" />

// @ts-nocheck — PocketBase JSVM runtime

migrate((app) => {
  // ── 1. users (extend auth collection) ──────────────────────────────
  const users = app.findCollectionByNameOrId('users')

  // Add custom fields. Auth users have 9 system fields (id, email, emailVisibility,
  // verified, username, lastResetSentAt, lastVerificationSentAt, tokenKey, passwordHash)
  // so custom fields start at index 9.
  let idx = 9
  users.fields.addAt(idx++, new TextField({ name: 'first_name', required: true }))
  users.fields.addAt(idx++, new TextField({ name: 'last_name', required: true }))
  users.fields.addAt(idx++, new SelectField({
    name: 'role', required: true, values: ['admin', 'representative'], maxSelect: 1,
  }))
  users.fields.addAt(idx++, new TextField({ name: 'job_title' }))
  users.fields.addAt(idx++, new TextField({ name: 'phone' }))
  users.fields.addAt(idx++, new FileField({
    name: 'avatar', maxSize: 2097152,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], maxFiles: 1,
  }))
  users.fields.addAt(idx++, new BoolField({ name: 'is_active' }))

  app.save(users)

  // ── 2. companies ──────────────────────────────────────────────────
  const companies = new Collection({
    name: 'companies',
    type: 'base',
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    fields: [
      { type: 'text', name: 'name', required: true },
      { type: 'text', name: 'address' },
      { type: 'text', name: 'city' },
      { type: 'text', name: 'province' },
      { type: 'text', name: 'postal_code' },
      {
        type: 'select',
        name: 'segment',
        values: ['Enterprise', 'Mid-Market', 'SMB'],
        maxSelect: 1,
      },
      { type: 'text', name: 'contact_person' },
      { type: 'text', name: 'contact_title' },
      { type: 'text', name: 'phone' },
      { type: 'email', name: 'email' },
      { type: 'text', name: 'notes' },
      { type: 'bool', name: 'is_active' },
    ],
  })

  app.save(companies)

  // ── 3. appointments ───────────────────────────────────────────────
  const appointments = new Collection({
    name: 'appointments',
    type: 'base',
    listRule:
      '@request.auth.role = "admin" || representative = @request.auth.id',
    viewRule:
      '@request.auth.role = "admin" || representative = @request.auth.id',
    createRule: '@request.auth.role = "admin"',
    updateRule:
      '@request.auth.role = "admin" || (representative = @request.auth.id && status != "cancelled" && status != "completed")',
    deleteRule: '@request.auth.role = "admin"',
    fields: [
      {
        type: 'relation',
        name: 'company',
        collectionId: companies.id,
        required: true,
        cascadeDelete: false,
      },
      {
        type: 'relation',
        name: 'representative',
        collectionId: users.id,
        required: true,
      },
      { type: 'date', name: 'scheduled_datetime', required: true },
      { type: 'date', name: 'end_datetime' },
      { type: 'date', name: 'original_datetime', required: true },
      { type: 'text', name: 'reference_code', unique: true },
      {
        type: 'select',
        name: 'status',
        required: true,
        values: ['pending', 'confirmed', 'completed', 'cancelled'],
        maxSelect: 1,
      },
      { type: 'text', name: 'notes' },
      { type: 'text', name: 'internal_notes' },
      {
        type: 'relation',
        name: 'created_by',
        collectionId: users.id,
        required: true,
      },
    ],
    indexes: [
      'CREATE INDEX idx_appointments_status ON appointments (status)',
      'CREATE INDEX idx_appointments_scheduled ON appointments (scheduled_datetime)',
    ],
  })

  app.save(appointments)

  // ── 4. appointment_modifications ──────────────────────────────────
  const modifications = new Collection({
    name: 'appointment_modifications',
    type: 'base',
    listRule:
      '@request.auth.role = "admin" || modified_by = @request.auth.id || appointment.representative = @request.auth.id',
    viewRule:
      '@request.auth.role = "admin" || modified_by = @request.auth.id || appointment.representative = @request.auth.id',
    createRule: '@request.auth.id != ""',
    updateRule: '',
    deleteRule: '',
    fields: [
      {
        type: 'relation',
        name: 'appointment',
        collectionId: appointments.id,
        required: true,
        cascadeDelete: true,
      },
      {
        type: 'relation',
        name: 'modified_by',
        collectionId: users.id,
        required: true,
      },
      { type: 'date', name: 'old_datetime', required: true },
      { type: 'date', name: 'new_datetime', required: true },
      { type: 'text', name: 'reason' },
    ],
  })

  app.save(modifications)

  // ── 5. signed_sheets ──────────────────────────────────────────────
  const sheets = new Collection({
    name: 'signed_sheets',
    type: 'base',
    listRule: '@request.auth.role = "admin" || uploaded_by = @request.auth.id',
    viewRule: '@request.auth.role = "admin" || uploaded_by = @request.auth.id',
    createRule: '@request.auth.role = "representative" && @request.auth.id != ""',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"',
    fields: [
      {
        type: 'relation',
        name: 'appointment',
        collectionId: appointments.id,
        required: true,
        cascadeDelete: true,
        unique: true,
      },
      {
        type: 'file',
        name: 'file',
        required: true,
        maxSize: 10485760,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        maxFiles: 1,
      },
      { type: 'text', name: 'file_name', required: true },
      { type: 'number', name: 'file_size' },
      { type: 'text', name: 'mime_type' },
      { type: 'text', name: 'notes' },
      {
        type: 'relation',
        name: 'uploaded_by',
        collectionId: users.id,
        required: true,
      },
      { type: 'bool', name: 'viewed_by_admin' },
      { type: 'date', name: 'viewed_at' },
    ],
  })

  sheets.indexes.push('CREATE UNIQUE INDEX idx_sheets_appointment_unique ON signed_sheets (appointment)')
  app.save(sheets)

  // ── 6. notifications ──────────────────────────────────────────────
  const notifications = new Collection({
    name: 'notifications',
    type: 'base',
    listRule: 'user = @request.auth.id || @request.auth.role = "admin"',
    viewRule: 'user = @request.auth.id || @request.auth.role = "admin"',
    createRule: '@request.auth.id != ""',
    updateRule: 'user = @request.auth.id',
    deleteRule: '',
    fields: [
      {
        type: 'relation',
        name: 'user',
        collectionId: users.id,
        required: true,
        cascadeDelete: true,
      },
      {
        type: 'relation',
        name: 'appointment',
        collectionId: appointments.id,
      },
      {
        type: 'select',
        name: 'type',
        required: true,
        values: [
          'appointment_created',
          'appointment_updated',
          'appointment_confirmed',
          'appointment_modified',
          'signed_sheet_uploaded',
          'appointment_cancelled',
        ],
        maxSelect: 1,
      },
      { type: 'text', name: 'title', required: true },
      { type: 'text', name: 'message', required: true },
      { type: 'bool', name: 'is_read' },
    ],
    indexes: [
      'CREATE INDEX idx_notifications_user_read ON notifications (user, is_read)',
    ],
  })

  app.save(notifications)
}, (app) => {
  // revert – drop all custom collections
  const collections = [
    'notifications',
    'signed_sheets',
    'appointment_modifications',
    'appointments',
    'companies',
  ]

  for (const name of collections) {
    const col = app.findCollectionByNameOrId(name)
    app.delete(col)
  }

  // remove custom fields from users
  const users = app.findCollectionByNameOrId('users')
  const customFields = [
    'first_name',
    'last_name',
    'role',
    'job_title',
    'phone',
    'avatar',
    'is_active',
  ]
  for (const name of customFields) {
    users.fields.removeByName(name)
  }
  app.save(users)
})
