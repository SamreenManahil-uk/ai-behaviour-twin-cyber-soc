import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SystemHealthPage } from './SystemHealthPage'

describe('SystemHealthPage', () => {
  it('shows live backend health when the API responds', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'healthy',
        service: 'CyberSoc.Api',
        version: '1.0.0',
        timestamp: '2026-09-11T15:00:00Z',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<SystemHealthPage />)

    expect(await screen.findByText('Operational')).toBeTruthy()
    expect(await screen.findByText('CyberSoc.Api')).toBeTruthy()
    expect(screen.getByText(/version 1.0.0/i)).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/health',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      }),
    )
  })

  it('shows a safe retry state when the API is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Connection refused')),
    )

    render(<SystemHealthPage />)

    expect(
      await screen.findByText(/ASP.NET Core API is unavailable/i),
    ).toBeTruthy()

    expect(
      screen.getByRole('button', { name: /retry/i }),
    ).toBeTruthy()
  })
})
