import { type Page, expect } from '@playwright/test'
import PocketBase from 'pocketbase'

export const TEST_PASSWORD = 'password123'
export const PB_URL = process.env.VITE_PB_URL ?? 'http://127.0.0.1:8090'

export async function login(page: Page, email: string, password = TEST_PASSWORD) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Accedi' }).click()
}

export async function createPbAdminClient() {
  const pb = new PocketBase(PB_URL)
  await pb.collection('users').authWithPassword('admin@itinera.it', TEST_PASSWORD)
  return pb
}

export async function getLatestNotificationForUser(userId: string) {
  const pb = await createPbAdminClient()
  const notifications = await pb.collection('notifications').getFullList({
    filter: pb.filter('user = {:userId}', { userId }),
  })
  return notifications.sort((a, b) => (a.created < b.created ? 1 : -1))[0] ?? null
}

export async function expectToast(page: Page, text: string | RegExp) {
  await expect(page.getByRole('alert').filter({ hasText: text })).toBeVisible({ timeout: 10_000 })
}
