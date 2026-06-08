/// <reference path="../pb_data/types.pb.d.ts" />

// @ts-nocheck — PocketBase JSVM runtime

migrate(
  (app) => {
    const appointmentsCol = app.findCollectionByNameOrId('appointments')
    const notificationsCol = app.findCollectionByNameOrId('notifications')

    // Fix confirmed appt #2: scheduled_datetime should match modification new_datetime
    const appt = app.findFirstRecordByFilter(
      appointmentsCol.name,
      'reference_code = "VIS-10001"',
    )
    if (appt) {
      const scheduled = new Date(appt.get('scheduled_datetime'))
      scheduled.setHours(scheduled.getHours() + 2)
      appt.set('scheduled_datetime', scheduled.toISOString())
      app.save(appt)
    }

    // Remove incorrect "confirmed" notification on pending appt #8
    const pendingAppt = app.findFirstRecordByFilter(
      appointmentsCol.name,
      'reference_code = "VIS-10007"',
    )
    if (pendingAppt) {
      const stale = app.findRecordsByFilter(
        notificationsCol.name,
        'appointment = {:apptId} && type = "appointment_confirmed"',
        '',
        0,
        0,
        { apptId: pendingAppt.id },
      )
      for (const rec of stale) {
        app.delete(rec)
      }
    }

    // Remove incorrect "updated" notification on completed appt #7
    const completedAppt = app.findFirstRecordByFilter(
      appointmentsCol.name,
      'reference_code = "VIS-10006"',
    )
    if (completedAppt) {
      const stale = app.findRecordsByFilter(
        notificationsCol.name,
        'appointment = {:apptId} && type = "appointment_updated"',
        '',
        0,
        0,
        { apptId: completedAppt.id },
      )
      for (const rec of stale) {
        app.delete(rec)
      }
    }
  },
  (app) => {
    const appointmentsCol = app.findCollectionByNameOrId('appointments')

    const appt = app.findFirstRecordByFilter(
      appointmentsCol.name,
      'reference_code = "VIS-10001"',
    )
    if (appt) {
      appt.set('scheduled_datetime', appt.get('original_datetime'))
      app.save(appt)
    }
  },
)
