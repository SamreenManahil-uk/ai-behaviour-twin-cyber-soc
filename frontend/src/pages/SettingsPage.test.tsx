import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SettingsPage } from './SettingsPage'

describe('SettingsPage', () => {
  it('saves analyst preferences in browser storage', async () => {
    const user = userEvent.setup()

    render(<SettingsPage />)

    const criticalOnly = screen.getByRole('checkbox', {
      name: /critical alerts only/i,
    })

    expect((criticalOnly as HTMLInputElement).checked).toBe(false)

    await user.click(criticalOnly)
    await user.click(
      screen.getByRole('button', { name: /save preferences/i }),
    )

    const saved = localStorage.getItem('soc-ui-preferences')

    expect(saved).not.toBeNull()
    expect(JSON.parse(saved ?? '{}').criticalOnly).toBe(true)
    expect(screen.getByText(/saved locally/i)).toBeTruthy()
  })

  it('supports keyboard-accessible settings navigation', async () => {
    const user = userEvent.setup()

    render(<SettingsPage />)

    await user.click(
      screen.getByRole('button', { name: /security/i }),
    )

    expect(
      screen.getByRole('heading', { name: /account security/i }),
    ).toBeTruthy()
    expect(screen.getByText(/jwt bearer access token/i)).toBeTruthy()
  })
})
