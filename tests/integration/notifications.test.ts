// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  createPbClient,
  isPocketBaseAvailable,
  loginAs,
  logout,
  TEST_USERS,
} from '../helpers/pocketbase'

const pocketBaseAvailable = await isPocketBaseAvailable()

describe.skipIf(!pocketBaseAvailable)('notifications integration', () => {
  it('creates a notification record with expected payload', async () => {
    const pb = await loginAs(createPbClient(), TEST_USERS.admin.email)

    const lucaAuthPb = await loginAs(createPbClient(), TEST_USERS.luca.email)
    const repId = lucaAuthPb.authStore.record!.id
    logout(lucaAuthPb)

    const notification = await pb.collection('notifications').create({
      user: repId,
      type: 'appointment_created',
      title: 'Test notification',
      message: 'Integration test message',
      is_read: false,
    })

    expect(notification.id).toBeTruthy()
    expect(notification.user).toBe(repId)
    expect(notification.type).toBe('appointment_created')
    expect(notification.title).toBe('Test notification')
    expect(notification.message).toBe('Integration test message')
    expect(notification.is_read).toBe(false)

    logout(pb)
  })
})
