import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '@/components/common/ProtectedRoute'

const mockUseAuth = vi.fn()
let mockIsValid = true

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/pocketbase', () => ({
  default: {
    authStore: {
      get isValid() {
        return mockIsValid
      },
    },
  },
}))

function TestPage() {
  return <div>Protected content</div>
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsValid = true
  })

  it('redirects to login when token is invalid', () => {
    mockIsValid = false
    mockUseAuth.mockReturnValue({
      authModel: { role: 'admin' },
      isLoading: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<TestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects to login when auth model is missing', () => {
    mockUseAuth.mockReturnValue({
      authModel: null,
      isLoading: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<TestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('redirects representative away from admin routes', () => {
    mockUseAuth.mockReturnValue({
      authModel: { role: 'representative' },
      isLoading: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/rep" element={<div>Rep home</div>} />
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<TestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Rep home')).toBeInTheDocument()
  })

  it('renders outlet for matching role', () => {
    mockUseAuth.mockReturnValue({
      authModel: { role: 'admin' },
      isLoading: false,
    })

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<TestPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
