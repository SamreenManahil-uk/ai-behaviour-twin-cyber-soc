import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RouteLoader } from './RouteLoader'

describe('RouteLoader', () => {
  it('announces page loading to assistive technology', () => {
    render(<RouteLoader />)

    expect(screen.getByRole('status')).toBeTruthy()
    expect(screen.getByText('Loading page...')).toBeTruthy()
  })
})
