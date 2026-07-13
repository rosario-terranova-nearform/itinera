import PocketBase from 'pocketbase'

export const PB_URL = process.env.VITE_PB_URL ?? 'http://127.0.0.1:8090'

export const TEST_PASSWORD = 'password123'

export const TEST_USERS = {
  admin: { email: 'admin@itinera.it', role: 'admin' },
  luca: { email: 'luca.bianchi@itinera.it', role: 'representative' },
  sara: { email: 'sara.verdi@itinera.it', role: 'representative' },
} as const

export async function isPocketBaseAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${PB_URL}/api/health`, { signal: AbortSignal.timeout(2000) })
    return response.ok
  } catch {
    return false
  }
}

export function createPbClient(): PocketBase {
  return new PocketBase(PB_URL)
}

export async function loginAs(
  pb: PocketBase,
  email: string,
): Promise<PocketBase> {
  await pb.collection('users').authWithPassword(email, TEST_PASSWORD)
  return pb
}

export async function logout(pb: PocketBase): Promise<void> {
  pb.authStore.clear()
}
