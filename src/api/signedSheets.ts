import pb from '@/lib/pocketbase'
import type { SignedSheetRecord } from '@/types'

export async function getByAppointmentId(appointmentId: string): Promise<SignedSheetRecord | null> {
  try {
    return await pb.collection('signed_sheets').getFirstListItem<SignedSheetRecord>(
      `appointment = "${appointmentId}"`,
    )
  } catch {
    return null
  }
}
