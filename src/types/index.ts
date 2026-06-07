import type { RecordModel } from 'pocketbase'

// ── Enumerati ──────────────────────────────────────────────────────

export type UserRole = 'admin' | 'representative'

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type NotificationType =
  | 'appointment_created'
  | 'appointment_updated'
  | 'appointment_confirmed'
  | 'appointment_modified'
  | 'signed_sheet_uploaded'
  | 'appointment_cancelled'

// ── Records ────────────────────────────────────────────────────────

export interface UserRecord extends RecordModel {
  email: string
  emailVisibility: boolean
  verified: boolean
  first_name: string
  last_name: string
  role: UserRole
  job_title: string
  phone: string
  avatar: string
  is_active: boolean
}

export interface CompanyRecord extends RecordModel {
  name: string
  address: string
  city: string
  province: string
  postal_code: string
  segment: 'Enterprise' | 'Mid-Market' | 'SMB' | ''
  contact_person: string
  contact_title: string
  phone: string
  email: string
  notes: string
  is_active: boolean
}

export interface AppointmentRecord extends RecordModel {
  company: string
  representative: string
  scheduled_datetime: string
  end_datetime: string
  original_datetime: string
  reference_code: string
  status: AppointmentStatus
  notes: string
  internal_notes: string
  created_by: string
  expand?: {
    company?: CompanyRecord
    representative?: UserRecord
    created_by?: UserRecord
  }
}

export interface AppointmentModificationRecord extends RecordModel {
  appointment: string
  modified_by: string
  old_datetime: string
  new_datetime: string
  reason: string
  expand?: {
    modified_by?: UserRecord
  }
}

export interface SignedSheetRecord extends RecordModel {
  appointment: string
  file: string
  file_name: string
  file_size: number
  mime_type: string
  notes: string
  uploaded_by: string
  viewed_by_admin: boolean
  viewed_at: string
}

export interface NotificationRecord extends RecordModel {
  user: string
  appointment: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
}

// ── Helpers ────────────────────────────────────────────────────────

export function getDisplayName(u: Pick<UserRecord, 'first_name' | 'last_name'>): string {
  return `${u.first_name} ${u.last_name}`.trim()
}
