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

describe.skipIf(!pocketBaseAvailable)('API authorization integration', () => {
  it('rep A cannot view appointments assigned to rep B', async () => {
    const lucaPb = await loginAs(createPbClient(), TEST_USERS.luca.email)
    const saraPb = await loginAs(createPbClient(), TEST_USERS.sara.email)

    const saraAppointments = await saraPb.collection('appointments').getFullList({
      sort: 'scheduled_datetime',
    })

    expect(saraAppointments.length).toBeGreaterThan(0)

    const saraAppointmentId = saraAppointments[0].id
    expect(saraAppointments[0].representative).toBe(saraPb.authStore.record?.id)

    await expect(
      lucaPb.collection('appointments').getOne(saraAppointmentId),
    ).rejects.toMatchObject({ status: 404 })

    logout(lucaPb)
    logout(saraPb)
  })

  it('rep cannot create companies', async () => {
    const repPb = await loginAs(createPbClient(), TEST_USERS.luca.email)

    try {
      await repPb.collection('companies').create({
        name: 'Unauthorized Company',
      })
      expect.fail('Expected company create to be rejected')
    } catch (error) {
      const status = (error as { status?: number }).status
      expect([400, 403]).toContain(status)
    }

    logout(repPb)
  })

  it('rep responses do not include internal_notes', async () => {
    const repPb = await loginAs(createPbClient(), TEST_USERS.luca.email)

    const appointments = await repPb.collection('appointments').getFullList()
    expect(appointments.length).toBeGreaterThan(0)

    for (const appointment of appointments) {
      expect(appointment).not.toHaveProperty('internal_notes')
    }

    const detail = await repPb.collection('appointments').getOne(appointments[0].id)
    expect(detail).not.toHaveProperty('internal_notes')

    logout(repPb)
  })

  it('admin can read internal_notes', async () => {
    const adminPb = await loginAs(createPbClient(), TEST_USERS.admin.email)

    const appointments = await adminPb.collection('appointments').getFullList({
      sort: 'scheduled_datetime',
    })
    expect(appointments.length).toBeGreaterThan(0)
    expect('internal_notes' in appointments[0]).toBe(true)

    logout(adminPb)
  })

  it('rep cannot update another rep appointment', async () => {
    const lucaPb = await loginAs(createPbClient(), TEST_USERS.luca.email)
    const saraPb = await loginAs(createPbClient(), TEST_USERS.sara.email)

    const saraAppointments = await saraPb.collection('appointments').getFullList({
      sort: 'scheduled_datetime',
    })
    const saraTarget = saraAppointments.find(
      (appointment) => appointment.representative === saraPb.authStore.record?.id,
    )
    expect(saraTarget).toBeDefined()

    try {
      await lucaPb.collection('appointments').update(saraTarget!.id, { status: 'confirmed' })
      expect.fail('Expected cross-rep update to be rejected')
    } catch (error) {
      const status = (error as { status?: number }).status
      expect([400, 403, 404]).toContain(status)
    }

    logout(lucaPb)
    logout(saraPb)
  })

  it('rep cannot list other users via admin-only users API', async () => {
    const repPb = await loginAs(createPbClient(), TEST_USERS.luca.email)

    const users = await repPb.collection('users').getFullList()
    expect(users).toEqual([])

    logout(repPb)
  })
})
