import { describe, it, expect } from 'vitest'
import dayjs from 'dayjs'
import PocketBase from 'pocketbase'
import { buildScheduledDatetime } from '@/utils/dateUtils'
import { generateReferenceCode } from '@/utils/referenceCode'
import { buildAppointmentsFilter } from '@/api/appointments'

const pb = new PocketBase('http://localhost')

describe('buildScheduledDatetime', () => {
  it('merges date and time into an ISO string', () => {
    const date = dayjs('2026-07-20')
    const time = dayjs('2026-07-20T14:30:00')

    const result = buildScheduledDatetime({ date, time })

    expect(dayjs(result).format('YYYY-MM-DD HH:mm')).toBe('2026-07-20 14:30')
  })
})

describe('generateReferenceCode', () => {
  it('returns VIS- prefix with first 6 chars uppercased', () => {
    expect(generateReferenceCode('abc123xyz')).toBe('VIS-ABC123')
  })
})

describe('buildAppointmentsFilter', () => {
  it('returns undefined when no filters are provided', () => {
    expect(buildAppointmentsFilter({})).toBeUndefined()
  })

  it('builds a safe filter with bound placeholders', () => {
    const filter = buildAppointmentsFilter({
      status: 'pending',
      representativeId: 'rep123',
      dateFrom: '2026-01-01T00:00:00.000Z',
      dateTo: '2026-12-31T23:59:59.000Z',
      activeOnly: true,
    })

    const expected = pb.filter(
      'status = {:status} && status != "cancelled" && status != "completed" && representative = {:representativeId} && scheduled_datetime >= {:dateFrom} && scheduled_datetime <= {:dateTo}',
      {
        status: 'pending',
        representativeId: 'rep123',
        dateFrom: '2026-01-01T00:00:00.000Z',
        dateTo: '2026-12-31T23:59:59.000Z',
      },
    )

    expect(filter).toBe(expected)
  })

  it('escapes malicious representativeId input', () => {
    const maliciousId = '" || id != ""'
    const filter = buildAppointmentsFilter({ representativeId: maliciousId })

    expect(filter).toBe(pb.filter('representative = {:representativeId}', { representativeId: maliciousId }))
    expect(filter).toMatch(/^representative = '/)
  })
})
