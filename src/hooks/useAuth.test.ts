import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  mockAuthWithPassword: vi.fn(),
  mockClear: vi.fn(),
  mockOnChange: vi.fn(),
  mockIsValid: true,
  mockModel: null as unknown,
}))

vi.mock('@/lib/pocketbase', () => ({
  default: {
    authStore: {
      get model() {
        return mocks.mockModel
      },
      get isValid() {
        return mocks.mockIsValid
      },
      clear: mocks.mockClear,
      onChange: mocks.mockOnChange,
    },
    collection: vi.fn(() => ({
      authWithPassword: mocks.mockAuthWithPassword,
    })),
  },
}))

import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.mockIsValid = true
    mocks.mockModel = null
    useAuthStore.setState({
      authModel: null,
      isLoading: false,
      error: null,
    })
    mocks.mockOnChange.mockImplementation((callback: (token: string, model: unknown) => void) => {
      callback('token', mocks.mockModel)
      return vi.fn()
    })
  })

  it('initializes auth store on mount', () => {
    const { unmount } = renderHook(() => useAuth())
    expect(mocks.mockOnChange).toHaveBeenCalled()
    unmount()
  })

  it('login stores active user and returns record', async () => {
    const user = {
      id: 'user1',
      email: 'admin@itinera.it',
      role: 'admin',
      is_active: true,
    }

    mocks.mockAuthWithPassword.mockResolvedValue({ record: user })

    const result = await useAuthStore.getState().login('admin@itinera.it', 'password123')

    expect(result).toEqual(user)
    expect(useAuthStore.getState().authModel).toEqual(user)
    expect(useAuthStore.getState().error).toBeNull()
  })

  it('login rejects deactivated accounts', async () => {
    const user = {
      id: 'user1',
      email: 'rep@itinera.it',
      role: 'representative',
      is_active: false,
    }

    mocks.mockAuthWithPassword.mockResolvedValue({ record: user })

    const result = await useAuthStore.getState().login('rep@itinera.it', 'password123')

    expect(result).toBeNull()
    expect(mocks.mockClear).toHaveBeenCalled()
    expect(useAuthStore.getState().authModel).toBeNull()
    expect(useAuthStore.getState().error).toContain('disattivato')
  })

  it('logout clears pocketbase auth store', () => {
    useAuthStore.setState({
      authModel: { id: 'user1', role: 'admin' } as never,
    })

    useAuthStore.getState().logout()

    expect(mocks.mockClear).toHaveBeenCalled()
    expect(useAuthStore.getState().authModel).toBeNull()
  })

  it('init clears model when token is invalid', () => {
    mocks.mockIsValid = false
    mocks.mockModel = { id: 'user1', role: 'admin' }

    useAuthStore.getState().init()

    expect(useAuthStore.getState().authModel).toBeNull()
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('exposes store state through useAuth hook', async () => {
    const user = {
      id: 'rep1',
      role: 'representative',
      email: 'luca.bianchi@itinera.it',
    } as never

    mocks.mockModel = user

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.authModel?.role).toBe('representative')
    })
  })
})
