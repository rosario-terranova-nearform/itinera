// pb_hooks/notifications.pb.js — sends email via SMTP on notification creation

onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const userId = record.getString('user')
  const title = record.getString('title')
  const msg = record.getString('message')

  try {
    const userRecord = $app.findRecordById('users', userId)
    const toEmail = userRecord.getString('email')
    const toName =
      userRecord.getString('first_name') + ' ' + userRecord.getString('last_name')

    const message = new MailerMessage({
      from: { address: $app.settings().meta.senderAddress, name: 'Itinera' },
      to: [{ name: toName, address: toEmail }],
      subject: title,
      text: msg,
    })

    $app.newMailClient().send(message)
  } catch (_) {
    // SMTP may be unavailable in dev/CI — notification record is still persisted.
  }

  e.next()
}, 'notifications')
