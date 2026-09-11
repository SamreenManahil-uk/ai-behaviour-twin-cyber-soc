import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../contexts/auth-context'
import { demoAlerts } from '../../data/demoEventsAlerts'
import { ToastProvider } from '../../providers/ToastProvider'
import type { AuthContextValue } from '../../contexts/auth-context'
import type { UserRole } from '../../types/auth'
import { SimulatedSoarPanel } from './SimulatedSoarPanel'

function renderPanel(role: UserRole) {
  const auth: AuthContextValue = {
    user: {
      id: `demo-${role.toLowerCase()}`,
      email: `${role.toLowerCase()}@example.test`,
      role,
      isActive: true,
    },
    isAuthenticated: true,
    isAuthenticating: false,
    login: vi.fn(),
    loginDemo: vi.fn(),
    logout: vi.fn(),
  }

  return render(
    <AuthContext.Provider value={auth}>
      <ToastProvider>
        <SimulatedSoarPanel alert={demoAlerts[0]} />
      </ToastProvider>
    </AuthContext.Provider>,
  )
}

describe('SimulatedSoarPanel', () => {
  it('records an explicitly browser-only Admin demo simulation', async () => {
    const user = userEvent.setup()
    renderPanel('Admin')

    await user.click(
      screen.getByRole('button', {
        name: 'Isolate endpoint',
      }),
    )

    expect(
      screen.getByRole('dialog', {
        name: 'Confirm Isolate endpoint',
      }),
    ).toBeInTheDocument()

    await user.type(
      screen.getByLabelText('Investigation reason'),
      'Repeated suspicious activity requires review.',
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Record simulation',
      }),
    )

    expect(
      await screen.findByText('Browser memory only'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/SIMULATION ONLY:/i),
    ).toBeInTheDocument()

    expect(
      screen.getByText(/No real system was changed/i),
    ).toBeInTheDocument()
  })

  it('prevents a SOC Analyst from creating simulated actions', () => {
    renderPanel('SocAnalyst')

    expect(
      screen.getByRole('button', {
        name: 'Isolate endpoint',
      }),
    ).toBeDisabled()

    expect(
      screen.getByText(/requires the Admin role/i),
    ).toBeInTheDocument()
  })
})
