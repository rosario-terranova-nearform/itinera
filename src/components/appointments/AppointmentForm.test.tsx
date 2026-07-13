import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AppointmentForm from '@/components/appointments/AppointmentForm'
import { renderWithProviders } from '@/test/test-utils'
import type { CompanyRecord, UserRecord } from '@/types'

vi.mock('@/hooks/useCompanies', () => ({
  useCompaniesQuery: () => ({
    data: [{ id: 'c1', name: 'Cartoleria Milano SRL' } satisfies Partial<CompanyRecord>],
  }),
}))

vi.mock('@/hooks/useRepresentatives', () => ({
  useRepresentativesQuery: () => ({
    data: [
      {
        id: 'r1',
        first_name: 'Luca',
        last_name: 'Bianchi',
        role: 'representative',
      } satisfies Partial<UserRecord>,
    ],
  }),
}))

describe('AppointmentForm', () => {
  it('shows validation errors when required fields are missing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <AppointmentForm open onClose={() => undefined} onSubmit={onSubmit} />,
    )

    await user.click(screen.getByRole('button', { name: /^Crea$/i }))

    expect(await screen.findByText(/seleziona un'azienda/i)).toBeInTheDocument()
    expect(await screen.findByText(/seleziona un rappresentante/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid form data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <AppointmentForm open onClose={() => undefined} onSubmit={onSubmit} />,
    )

    const dialog = screen.getByRole('dialog')
    const dialogQueries = within(dialog)
    await user.click(dialogQueries.getByLabelText(/^Azienda/i))
    await user.click(await screen.findByText('Cartoleria Milano SRL'))

    await user.click(dialogQueries.getByLabelText(/^Rappresentante/i))
    await user.click(await screen.findByText('Luca Bianchi'))

    await user.click(dialogQueries.getByRole('button', { name: /^Crea$/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const payload = onSubmit.mock.calls[0][0]
    expect(payload.companyId).toBe('c1')
    expect(payload.representativeId).toBe('r1')
    expect(payload.scheduled_datetime.isValid()).toBe(true)
  })
})
