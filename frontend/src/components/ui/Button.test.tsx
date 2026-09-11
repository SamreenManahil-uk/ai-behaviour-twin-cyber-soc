import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders an accessible button and handles clicks', () => {
    const onClick = vi.fn()

    render(
      <Button type="button" onClick={onClick}>
        Investigate alert
      </Button>,
    )

    const button = screen.getByRole('button', {
      name: 'Investigate alert',
    })

    fireEvent.click(button)

    expect(button).toBeTruthy()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('prevents interaction when disabled', () => {
    const onClick = vi.fn()

    render(
      <Button type="button" disabled onClick={onClick}>
        Contain endpoint
      </Button>,
    )

    const button = screen.getByRole('button', {
      name: 'Contain endpoint',
    })

    fireEvent.click(button)

    expect(button.hasAttribute('disabled')).toBe(true)
    expect(onClick).not.toHaveBeenCalled()
  })
})
