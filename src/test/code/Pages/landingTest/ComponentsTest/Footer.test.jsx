// Footer.test.jsx
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// The Footer imports Logo from an absolute path in your file.
// Mock that exact path so the component renders in tests.
vi.mock('c:/project/jit_ms1/Security_ims/src/components/Logo.jsx', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-logo">MockLogo</div>,
  }
})

import Footer from "c:/project/jit_ms1/Security_ims/src/landing/Components/Footer.jsx"

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Footer component', () => {
  it('renders dashboard-version when pathname starts with /hr/ or other dashboard prefixes', () => {
    // simulate dashboard path
    delete window.location
    // eslint-disable-next-line no-global-assign
    window.location = { pathname: '/hr/dashboard' }

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    const copyrightText = screen.getByText(/IMS. All rights reserved./i)
    expect(copyrightText).toBeInTheDocument()

    // quick links should not appear in this minimal dashboard footer
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument()

    // privacy link text present
    expect(screen.getAllByText(/Privacy/i)).toHaveLength(2)
  })

  it('renders full public footer when not on dashboard routes', () => {
    delete window.location
    // eslint-disable-next-line no-global-assign
    window.location = { pathname: '/home' }

    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

    // Mocked logo should render
    expect(screen.getByTestId('mock-logo')).toBeInTheDocument()

    // Quick Links section should be present
    expect(screen.getByText(/Quick Links/i)).toBeInTheDocument()
    expect(screen.getByText(/Home/i)).toBeInTheDocument()
    expect(screen.getByText(/About Us/i)).toBeInTheDocument()

    // Contact Info should be present
    expect(screen.getByText(/sales@jitglobalinfosystems.com/i)).toBeInTheDocument()
    expect(screen.getByText(/\+91 78100 99942/)).toBeInTheDocument()

    // Copyright with current year
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })
})
