import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeverityBadge } from './SeverityBadge'

describe('SeverityBadge', () => {
  it.each(['Critical', 'High', 'Medium', 'Low'])(
    'renders the %s severity',
    (severity) => {
      render(
        <SeverityBadge
          severity={severity as 'Critical' | 'High' | 'Medium' | 'Low'}
        />,
      )

      expect(screen.getByText(severity)).toBeTruthy()
    },
  )
})
