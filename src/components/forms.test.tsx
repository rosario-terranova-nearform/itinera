import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import RescheduleForm from '@/components/appointments/RescheduleForm'
import CompanyForm from '@/components/companies/CompanyForm'
import { renderWithProviders } from '@/test/test-utils'
import type { AppointmentRecord, CompanyRecord } from '@/types'

const appointment = {
  id: 'apt1',
  scheduled_datetime: '2026-07-20T09:00:00.000Z',
  expand: {
    company: {
      id: 'c1',
      name: 'Cartoleria Milano SRL',
      address: 'Via Roma 1',
      city: 'Milano',
      province: 'MI',
    },
  },
} as AppointmentRecord

describe('RescheduleForm', () => {
  it('requires a reason before submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(<RescheduleForm appointment={appointment} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /salva nuova data/i }))

    expect(await screen.findByText(/motivo è obbligatorio/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits date, time and reason', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(<RescheduleForm appointment={appointment} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/motivo della modifica/i), 'Impegno improvviso')
    await user.click(screen.getByRole('button', { name: /salva nuova data/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const payload = onSubmit.mock.calls[0][0]
    expect(payload.reason).toBe('Impegno improvviso')
    expect(dayjs.isDayjs(payload.date)).toBe(true)
    expect(dayjs.isDayjs(payload.time)).toBe(true)
  })
})

describe('CompanyForm', () => {
  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <CompanyForm open onClose={() => undefined} onSubmit={onSubmit} />,
    )

    await user.click(screen.getByRole('button', { name: /^Crea$/i }))

    expect(await screen.findByText(/nome è obbligatorio/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <CompanyForm open onClose={() => undefined} onSubmit={onSubmit} />,
    )

    await user.type(screen.getByLabelText(/^nome/i), 'Nuova Azienda')
    await user.type(screen.getByLabelText(/^email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /^Crea$/i }))

    expect(await screen.findByText(/email non valida/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid company data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(
      <CompanyForm
        open
        onClose={() => undefined}
        onSubmit={onSubmit}
        initialData={
          {
            id: 'c1',
            name: 'Cartoleria Milano SRL',
            city: 'Milano',
          } as CompanyRecord
        }
        title="Modifica azienda"
      />,
    )

    await user.click(screen.getByRole('button', { name: /salva/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    expect(onSubmit.mock.calls[0][0].name).toBe('Cartoleria Milano SRL')
  })
})
