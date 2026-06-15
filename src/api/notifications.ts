import pb from '@/lib/pocketbase'
import type { NotificationRecord, NotificationType } from '@/types'

export interface CreateNotificationInput {
  user: string
  appointment?: string
  type: NotificationType
  title: string
  message: string
}

export async function createNotification(
  data: CreateNotificationInput,
): Promise<NotificationRecord> {
  return pb.collection('notifications').create<NotificationRecord>({
    user: data.user,
    appointment: data.appointment ?? '',
    type: data.type,
    title: data.title,
    message: data.message,
    is_read: false,
  })
}
