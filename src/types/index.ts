import type { Tables, Enums } from '@/lib/database.types'

export type Profile = Tables<'profiles'>
export type Company = Tables<'companies'>
export type Appointment = Tables<'appointments'>
export type AppointmentModification = Tables<'appointment_modifications'>
export type SignedSheet = Tables<'signed_sheets'>
export type Notification = Tables<'notifications'>

export type UserRole = Enums<'user_role'>
export type AppointmentStatus = Enums<'appointment_status'>
export type NotificationType = Enums<'notification_type'>
