import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from '@playwright/test'
import PocketBase from 'pocketbase'
import { createPbAdminClient, expectToast, login, PB_URL, TEST_PASSWORD } from './helpers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturePath = path.join(__dirname, 'fixtures', 'sample.pdf')

async function loginRepByEmail(email: string) {
  const pb = new PocketBase(PB_URL)
  const { record } = await pb.collection('users').authWithPassword(email, TEST_PASSWORD)
  return { pb, rep: record }
}

test.describe('Representative flow', () => {
  test('login, confirm, reschedule, upload signed sheet', async ({ page }) => {
    const adminPb = await createPbAdminClient()
    const { rep } = await loginRepByEmail('marco.gialli@itinera.it')
    const adminUser = adminPb.authStore.record!

    const company = await adminPb.collection('companies').getFirstListItem(
      adminPb.filter('is_active = true'),
      { sort: 'name' },
    )

    const scheduledDatetime = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()

    const pendingAppointment = await adminPb.collection('appointments').create({
      company: company.id,
      representative: rep.id,
      scheduled_datetime: scheduledDatetime,
      end_datetime: '',
      original_datetime: scheduledDatetime,
      reference_code: `VIS-E2E${Date.now().toString(36).slice(-4).toUpperCase()}`,
      status: 'pending',
      notes: 'Appuntamento E2E',
      internal_notes: '',
      created_by: adminUser.id,
    })

    await login(page, rep.email)
    await expect(page).toHaveURL(/\/rep/)

    await page.goto(`/rep/appointments/${pendingAppointment.id}`)
    await expect(page.getByRole('button', { name: 'Conferma visita' })).toBeVisible()

    await page.getByRole('button', { name: 'Conferma visita' }).click()
    await page.getByRole('button', { name: 'Conferma visita' }).last().click()
    await expectToast(page, /visita confermata/i)

    await page.getByRole('button', { name: 'Modifica data/ora' }).click()
    await expect(page).toHaveURL(new RegExp(`/rep/appointments/${pendingAppointment.id}/reschedule`))

    await page.getByLabel('Motivo della modifica *').fill('Test E2E riprogrammazione')
    await page.getByRole('button', { name: 'Salva nuova data' }).click()
    await expectToast(page, /riprogrammato/i)

    await page.goto(`/rep/appointments/${pendingAppointment.id}`)
    await page.getByRole('button', { name: 'Carica foglio firma' }).click()
    await expect(page).toHaveURL(new RegExp(`/rep/documents\\?appointment_id=${pendingAppointment.id}`))

    await page.locator('input[type="file"]').setInputFiles(fixturePath)
    await page.getByRole('button', { name: 'Carica documento' }).click()
    await expectToast(page, /foglio firma caricato/i)

    const updated = await adminPb.collection('appointments').getOne(pendingAppointment.id)
    expect(updated.status).toBe('completed')

    const sheet = await adminPb.collection('signed_sheets').getFirstListItem(
      adminPb.filter('appointment = {:appointmentId}', { appointmentId: pendingAppointment.id }),
    )
    expect(sheet.file_name).toBe('sample.pdf')
  })
})
