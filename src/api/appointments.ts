import pb from '@/lib/pocketbase'
import type { AppointmentRecord } from '@/types'

export async function getByCompany(companyId: string): Promise<AppointmentRecord[]> {
  return pb.collection('appointments').getFullList<AppointmentRecord>({
    filter: `company = "${companyId}"`,
    sort: '-scheduled_datetime',
    expand: 'representative,created_by',
  })
}
