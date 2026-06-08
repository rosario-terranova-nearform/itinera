/**
 * Seeds signed_sheets for completed appointments (VIS-10002, VIS-10006).
 * File fields cannot be set in pb_migrations — run after `./pocketbase migrate up`.
 *
 * Usage:
 *   PB_SUPERUSER_EMAIL=... PB_SUPERUSER_PASSWORD=... npm run pb:seed-files
 *
 * Requires PocketBase running and seed migration applied.
 */

import PocketBase from 'pocketbase'
import { File } from 'node:buffer'

const PB_URL = process.env.VITE_PB_URL ?? 'http://127.0.0.1:8090'
const SUPER_EMAIL = process.env.PB_SUPERUSER_EMAIL
const SUPER_PASS = process.env.PB_SUPERUSER_PASSWORD

const COMPLETED_CODES = ['VIS-10002', 'VIS-10006']

// 1×1 PNG
const FILE_BYTES = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

async function authPb() {
  const pb = new PocketBase(PB_URL)
  pb.autoCancellation(false)

  if (SUPER_EMAIL && SUPER_PASS) {
    await pb.collection('_superusers').authWithPassword(SUPER_EMAIL, SUPER_PASS)
    return pb
  }

  throw new Error(
    'Set PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD (PocketBase superadmin credentials).',
  )
}

async function seedSheet(pb, referenceCode) {
  const appt = await pb
    .collection('appointments')
    .getFirstListItem(`reference_code="${referenceCode}" && status="completed"`, {
      expand: 'representative',
    })

  try {
    await pb.collection('signed_sheets').getFirstListItem(`appointment="${appt.id}"`)
    console.log(`  skip ${referenceCode} — sheet already exists`)
    return
  } catch {
    // not found — create below
  }

  const repId =
    typeof appt.representative === 'string' ? appt.representative : appt.expand?.representative?.id

  if (!repId) {
    throw new Error(`No representative on appointment ${referenceCode}`)
  }

  const fileName = `foglio-${referenceCode}.png`
  const formData = new FormData()
  formData.append('file', new File([FILE_BYTES], fileName, { type: 'image/png' }))
  formData.append('file_name', fileName)
  formData.append('appointment', appt.id)
  formData.append('uploaded_by', repId)

  await pb.collection('signed_sheets').create(formData)
  console.log(`  created signed sheet for ${referenceCode}`)
}

async function main() {
  console.log(`Seeding signed sheets via ${PB_URL}…`)

  const pb = await authPb()

  for (const code of COMPLETED_CODES) {
    try {
      await seedSheet(pb, code)
    } catch (err) {
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? JSON.stringify(err.response)
          : String(err)
      throw new Error(`${code}: ${detail}`)
    }
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
