// Logo.test.jsx
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// If your build imports static assets and they break in tests, mock the image import.
// Adjust the mock path if needed (relative to test file).
vi.mock("c:/project/jit_ms1/Security_ims/src/assets/logo.png", () => ({
  default: '/mock-logo.png'
}));

// Import after mocking
import Logo from "c:/project/jit_ms1/Security_ims/src/components/Logo.jsx"

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Logo component', () => {
  it('renders link to home with image and brand text', () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    )

    // Link rendered as an anchor with href="/"
    const anchor = screen.getByRole('link')
    expect(anchor).toBeInTheDocument()
    // In MemoryRouter Link renders an <a href="/"> — assert href ends with /
    expect(anchor.getAttribute('href')).toBe('/')

    // Image with alt text present and src contains mocked value
    const img = screen.getByAltText('Logo')
    expect(img).toBeInTheDocument()
    expect(img.getAttribute('src')).toContain('mock-logo.png')

    // Brand name text present
    expect(screen.getByText(/Your Brand Name/i)).toBeInTheDocument()
  })

  it('accepts className and spreads extra props', () => {
    render(
      <MemoryRouter>
        <Logo className="custom-class" data-testid="my-logo" />
      </MemoryRouter>
    )

    const anchor = screen.getByTestId('my-logo')
    expect(anchor).toBeInTheDocument()
    // className applied to link
    expect(anchor.className).toContain('custom-class')
  })
})
