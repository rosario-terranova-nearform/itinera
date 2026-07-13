import { test, expect } from '@playwright/test'
import PocketBase from 'pocketbase'
import { createPbAdminClient, expectToast, getLatestNotificationForUser, login, PB_URL, TEST_PASSWORD } from './helpers'

async function getUserIdByEmail(email: string): Promise<string> {
  const pb = new PocketBase(PB_URL)
  const { record } = await pb.collection('users').authWithPassword(email, TEST_PASSWORD)
  return record.id
}

test.describe('Admin flow', () => {
  test('login, create appointment, verify notification', async ({ page }) => {
    const pb = await createPbAdminClient()
    const repId = await getUserIdByEmail('luca.bianchi@itinera.it')

    const companies = await pb.collection('companies').getFullList({ sort: 'name' })
    expect(companies.length).toBeGreaterThan(0)

    const beforeNotifications = await pb.collection('notifications').getFullList({
      filter: pb.filter('user = {:userId}', { userId: repId }),
    })

    await login(page, 'admin@itinera.it')
    await expect(page).toHaveURL(/\/admin/)

    await page.goto('/admin/appointments')
    await page.getByRole('button', { name: 'Crea appuntamento' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByLabel(/^Azienda/i).click()
    await page.getByRole('option', { name: companies[0].name }).click()
    await dialog.getByLabel(/^Rappresentante/i).click()
    await page.getByRole('option', { name: /Luca Bianchi/i }).click()
    await dialog.getByRole('button', { name: /^Crea$/i }).click()

    await expectToast(page, /appuntamento creato/i)

    await expect
      .poll(async () => {
        const items = await pb.collection('notifications').getFullList({
          filter: pb.filter('user = {:userId}', { userId: repId }),
        })
        return items.length
      })
      .toBeGreaterThan(beforeNotifications.length)

    const latest = await getLatestNotificationForUser(repId)
    expect(latest?.type).toBe('appointment_created')
    expect(latest?.title).toMatch(/nuovo incarico/i)
  })
})
