/// <reference path="../pb_data/types.pb.d.ts" />

// @ts-nocheck

migrate((app) => {
  const usersCol = app.findCollectionByNameOrId('users')
  const companiesCol = app.findCollectionByNameOrId('companies')
  const appointmentsCol = app.findCollectionByNameOrId('appointments')
  const modificationsCol = app.findCollectionByNameOrId('appointment_modifications')
  const sheetsCol = app.findCollectionByNameOrId('signed_sheets')
  const notificationsCol = app.findCollectionByNameOrId('notifications')

  // ── Admin ────────────────────────────────────────────────────────
  const admin = new Record(usersCol)
  admin.set('email', 'admin@itinera.test')
  admin.set('password', 'Password123!')
  admin.set('verified', true)
  admin.set('first_name', 'Marco')
  admin.set('last_name', 'Rossi')
  admin.set('role', 'admin')
  admin.set('job_title', 'Unità Centrale')
  admin.set('is_active', true)
  app.save(admin)

  // ── 3 Representatives ────────────────────────────────────────────
  const reps = []
  const repData = [
    {
      email: 'anna.bianchi@itinera.test',
      first_name: 'Anna',
      last_name: 'Bianchi',
      job_title: 'Rappresentante commerciale',
    },
    {
      email: 'luigi.verdi@itinera.test',
      first_name: 'Luigi',
      last_name: 'Verdi',
      job_title: 'Rappresentante senior',
    },
    {
      email: 'sara.neri@itinera.test',
      first_name: 'Sara',
      last_name: 'Neri',
      job_title: 'Rappresentante area nord',
    },
  ]

  for (const r of repData) {
    const rec = new Record(usersCol)
    rec.set('email', r.email)
    rec.set('password', 'Password123!')
    rec.set('verified', true)
    rec.set('first_name', r.first_name)
    rec.set('last_name', r.last_name)
    rec.set('role', 'representative')
    rec.set('job_title', r.job_title)
    rec.set('is_active', true)
    app.save(rec)
    reps.push(rec)
  }

  // ── 5 Companies ──────────────────────────────────────────────────
  const compData = [
    {
      name: 'Cartoleria Milano SRL',
      address: 'Via Roma 12',
      city: 'Milano',
      province: 'MI',
      postal_code: '20121',
      segment: 'Enterprise',
      contact_person: 'Giuseppe Verdi',
      contact_title: 'Direttore acquisti',
      phone: '02 1234567',
      email: 'acquisti@cartoleriamilano.it',
      is_active: true,
    },
    {
      name: 'Ufficio Moderno spa',
      address: 'Corso Italia 45',
      city: 'Torino',
      province: 'TO',
      postal_code: '10122',
      segment: 'Mid-Market',
      contact_person: 'Maria Bianchi',
      contact_title: 'Resp. ufficio acquisti',
      phone: '011 7654321',
      email: 'mbianchi@ufficiomoderno.it',
      is_active: true,
    },
    {
      name: 'Cancelleria Amica snc',
      address: 'Via Napoli 78',
      city: 'Roma',
      province: 'RM',
      postal_code: '00184',
      segment: 'SMB',
      contact_person: 'Carlo Rossi',
      contact_title: 'Titolare',
      phone: '06 9876543',
      email: 'info@cancelleriaamica.it',
      is_active: true,
    },
    {
      name: 'Paper & Co.',
      address: 'Piazza Dante 3',
      city: 'Bologna',
      province: 'BO',
      postal_code: '40125',
      segment: 'Enterprise',
      contact_person: 'Elena Ferrari',
      contact_title: 'Resp. approvvigionamenti',
      phone: '051 4567890',
      email: 'e.ferrari@paperco.it',
      is_active: true,
    },
    {
      name: 'Office World SRL',
      address: 'Via Mazzini 56',
      city: 'Firenze',
      province: 'FI',
      postal_code: '50123',
      segment: 'Mid-Market',
      contact_person: 'Francesco Esposito',
      contact_title: 'Store manager',
      phone: '055 2345678',
      email: 'f.esposito@officeworld.it',
      is_active: false,
    },
  ]

  const companies = []
  for (const c of compData) {
    const rec = new Record(companiesCol)
    rec.set('name', c.name)
    rec.set('address', c.address)
    rec.set('city', c.city)
    rec.set('province', c.province)
    rec.set('postal_code', c.postal_code)
    rec.set('segment', c.segment)
    rec.set('contact_person', c.contact_person)
    rec.set('contact_title', c.contact_title)
    rec.set('phone', c.phone)
    rec.set('email', c.email)
    rec.set('is_active', c.is_active)
    app.save(rec)
    companies.push(rec)
  }

  // ── 8 Appointments ───────────────────────────────────────────────
  const now = new Date()

  const apptData = [
    { company: companies[0], representative: reps[0], scheduled: 1, status: 'pending' },
    { company: companies[1], representative: reps[0], scheduled: 2, status: 'confirmed' },
    { company: companies[2], representative: reps[1], scheduled: 3, status: 'completed' },
    { company: companies[3], representative: reps[1], scheduled: 5, status: 'cancelled' },
    { company: companies[0], representative: reps[2], scheduled: 7, status: 'pending' },
    { company: companies[4], representative: reps[2], scheduled: 10, status: 'confirmed' },
    { company: companies[1], representative: reps[0], scheduled: 14, status: 'pending' },
    { company: companies[3], representative: reps[1], scheduled: 21, status: 'confirmed' },
  ]

  const apptRecords = []
  for (let i = 0; i < apptData.length; i++) {
    const a = apptData[i]
    const d = new Date(now)
    d.setDate(d.getDate() + a.scheduled)
    d.setHours(9 + Math.floor(i / 2) * 2, 0, 0, 0)

    const end = new Date(d)
    end.setHours(end.getHours() + 1)

    const code = `VIS-${String(10000 + i).slice(0, 6)}`

    const rec = new Record(appointmentsCol)
    rec.set('company', a.company.id)
    rec.set('representative', a.representative.id)
    rec.set('scheduled_datetime', d.toISOString())
    rec.set('end_datetime', end.toISOString())
    rec.set('original_datetime', d.toISOString())
    rec.set('reference_code', code)
    rec.set('status', a.status)
    rec.set('notes', `Visita ordinaria ${a.company.get('name')}`)
    rec.set(
      'internal_notes',
      a.status === 'pending' ? 'Cliente da seguire con attenzione' : '',
    )
    rec.set('created_by', admin.id)
    app.save(rec)
    apptRecords.push(rec)
  }

  // ── 1 Modification log ───────────────────────────────────────────
  const modAppt = apptRecords[1]
  const origDate = new Date(modAppt.get('original_datetime'))
  const newDate = new Date(origDate)
  newDate.setHours(newDate.getHours() + 2)

  const mod = new Record(modificationsCol)
  mod.set('appointment', modAppt.id)
  mod.set('modified_by', reps[0].id)
  mod.set('old_datetime', origDate.toISOString())
  mod.set('new_datetime', newDate.toISOString())
  mod.set('reason', 'Sovrapposizione con altra visita')
  app.save(mod)

  // ── 2 Signed sheets (for completed appointment) ──────────────────
  // Skipped — file fields cannot be seeded via migrations
  //

  // ── Notifications ────────────────────────────────────────────────
  const notifData = [
    {
      user: reps[0],
      appointment: apptRecords[0],
      type: 'appointment_created',
      title: 'Nuovo incarico – Cartoleria Milano SRL',
      message: 'Ti è stato assegnato un nuovo appuntamento per il giorno ...',
    },
    {
      user: reps[0],
      appointment: apptRecords[1],
      type: 'appointment_created',
      title: 'Nuovo incarico – Ufficio Moderno spa',
      message: 'Ti è stato assegnato un nuovo appuntamento per il giorno ...',
    },
    {
      user: admin,
      appointment: apptRecords[1],
      type: 'appointment_confirmed',
      title: 'Appuntamento confermato da Anna Bianchi',
      message: "Anna Bianchi ha confermato l'appuntamento per il giorno ...",
    },
    {
      user: reps[0],
      appointment: apptRecords[1],
      type: 'appointment_modified',
      title: 'Appuntamento modificato – Ufficio Moderno spa',
      message: "Hai modificato l'orario dell'appuntamento.",
    },
    {
      user: reps[1],
      appointment: apptRecords[2],
      type: 'appointment_created',
      title: 'Nuovo incarico – Cancelleria Amica snc',
      message: 'Ti è stato assegnato un nuovo appuntamento.',
    },
    {
      user: admin,
      appointment: apptRecords[2],
      type: 'signed_sheet_uploaded',
      title: 'Foglio firma ricevuto – Cancelleria Amica snc',
      message: 'Luigi Verdi ha caricato il foglio firma.',
    },
    {
      user: reps[1],
      appointment: apptRecords[3],
      type: 'appointment_cancelled',
      title: 'Appuntamento annullato – Paper & Co.',
      message: "L'appuntamento del ... è stato annullato.",
    },
    {
      user: reps[2],
      appointment: apptRecords[4],
      type: 'appointment_created',
      title: 'Nuovo incarico – Cartoleria Milano SRL',
      message: 'Ti è stato assegnato un nuovo appuntamento.',
    },
    {
      user: reps[2],
      appointment: apptRecords[5],
      type: 'appointment_created',
      title: 'Nuovo incarico – Office World SRL',
      message: 'Ti è stato assegnato un nuovo appuntamento.',
    },
    {
      user: admin,
      appointment: apptRecords[5],
      type: 'appointment_confirmed',
      title: 'Appuntamento confermato da Sara Neri',
      message: 'Sara Neri ha confermato.',
    },
    {
      user: reps[0],
      appointment: apptRecords[6],
      type: 'appointment_created',
      title: 'Nuovo incarico – Ufficio Moderno spa',
      message: 'Ti è stato assegnato un nuovo appuntamento.',
    },
    {
      user: admin,
      appointment: apptRecords[6],
      type: 'appointment_updated',
      title: 'Incarico modificato – Ufficio Moderno spa',
      message: "L'appuntamento del ... è stato modificato.",
    },
    {
      user: reps[1],
      appointment: apptRecords[7],
      type: 'appointment_created',
      title: 'Nuovo incarico – Paper & Co.',
      message: 'Ti è stato assegnato un nuovo appuntamento per Paper & Co.',
    },
    {
      user: reps[1],
      appointment: apptRecords[7],
      type: 'appointment_confirmed',
      title: 'Appuntamento confermato – Paper & Co.',
      message: "Hai confermato l'appuntamento del ...",
    },
  ]

  for (const n of notifData) {
    const rec = new Record(notificationsCol)
    rec.set('user', n.user.id)
    rec.set('appointment', n.appointment.id)
    rec.set('type', n.type)
    rec.set('title', n.title)
    rec.set('message', n.message)
    rec.set('is_read', false)
    app.save(rec)
  }
}, (app) => {
  // revert – clear all seeded records
  const collections = [
    'notifications',
    'signed_sheets',
    'appointment_modifications',
    'appointments',
    'companies',
    'users',
  ]

  for (const name of collections) {
    const col = app.findCollectionByNameOrId(name)
    const records = app.findRecordsByFilter(col.name || col.id, '1=1', '', 0, 0)
    for (const rec of records) {
      if (name === 'users' && rec.get('email') === 'admin@itinera.test') continue
      app.delete(rec)
    }
  }
})
