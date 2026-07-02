import pb from '@/lib/pocketbase'
import type { UserRecord } from '@/types'

export interface CreateRepresentativeInput {
  email: string
  first_name: string
  last_name: string
}

function generateTemporaryPassword(): string {
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  return `Aa1!${random}`
}

export async function getRepresentatives(): Promise<UserRecord[]> {
  return pb.collection('users').getFullList<UserRecord>({
    filter: pb.filter('role = {:role}', { role: 'representative' }),
    sort: 'last_name,first_name',
  })
}

export interface CreateRepresentativeResult {
  record: UserRecord
  welcomeEmailSent: boolean
}

export async function createRepresentative(
  input: CreateRepresentativeInput,
): Promise<CreateRepresentativeResult> {
  const password = generateTemporaryPassword()

  const record = await pb.collection('users').create<UserRecord>({
    email: input.email,
    password,
    passwordConfirm: password,
    first_name: input.first_name,
    last_name: input.last_name,
    role: 'representative',
    is_active: true,
    emailVisibility: false,
  })

  let welcomeEmailSent = false
  try {
    await pb.collection('users').requestPasswordReset(input.email)
    welcomeEmailSent = true
  } catch {
    // Account was created; welcome email may fail if SMTP is not configured.
  }

  return { record, welcomeEmailSent }
}

export async function setRepresentativeActive(id: string, is_active: boolean): Promise<UserRecord> {
  return pb.collection('users').update<UserRecord>(id, { is_active })
}

export type ProfileUpdateInput = {
  first_name: string
  last_name: string
  phone: string
}

export type PasswordUpdateInput = {
  oldPassword: string
  password: string
  passwordConfirm: string
}

export async function updateProfile(id: string, data: ProfileUpdateInput): Promise<UserRecord> {
  return pb.collection('users').update<UserRecord>(id, data)
}

export async function updatePassword(id: string, data: PasswordUpdateInput): Promise<UserRecord> {
  return pb.collection('users').update<UserRecord>(id, data)
}

export async function uploadAvatar(id: string, file: File): Promise<UserRecord> {
  const formData = new FormData()
  formData.append('avatar', file)
  return pb.collection('users').update<UserRecord>(id, formData)
}
