// WhyIMS.test.jsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import WhyIMS from "c:/project/jit_ms1/Security_ims/src/landing/pages/whyrms";

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock react-router-dom's useNavigate
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('WhyIMS component', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <WhyIMS />
      </MemoryRouter>
    )

  it('renders hero heading and description', () => {
    renderComponent()
    expect(screen.getByRole('heading', { name: /Why Choose IMS\?/i })).toBeInTheDocument()
    expect(
      screen.getByText(/Discover how IMS is revolutionizing recruitment with intelligent automation/i)
    ).toBeInTheDocument()
  })

  it('navigates to /candidate-register when hero Get Started clicked', () => {
    renderComponent()
    const startBtn = screen.getAllByRole('button', { name: /Get Started/i })[0]
    expect(startBtn).toBeInTheDocument()
    fireEvent.click(startBtn)
    expect(navigateMock).toHaveBeenCalledWith('/candidate-register')
  })

  it('renders benefits cards with titles and stats', () => {
    renderComponent()
    expect(screen.getByText(/Faster Hiring/i)).toBeInTheDocument()
    expect(screen.getByText(/60% faster/i)).toBeInTheDocument()

    expect(screen.getByText(/Better Quality Hires/i)).toBeInTheDocument()
    expect(screen.getByText(/40% better retention/i)).toBeInTheDocument()

    expect(screen.getByText(/Reduced Costs/i)).toBeInTheDocument()
    expect(screen.getByText(/50% cost reduction/i)).toBeInTheDocument()

    expect(screen.getByText(/Enhanced Experience/i)).toBeInTheDocument()
    expect(screen.getByText(/90% satisfaction/i)).toBeInTheDocument()
  })

  it('renders feature categories and their items', () => {
    renderComponent()
    expect(screen.getByText(/Smart Automation/i)).toBeInTheDocument()
    expect(screen.getByText(/Automated candidate screening and scoring/i)).toBeInTheDocument()
    expect(screen.getByText(/Interview scheduling with calendar integration/i)).toBeInTheDocument()

    expect(screen.getAllByText(/Advanced Analytics/i)).toHaveLength(2)
    expect(screen.getByText(/Real-time hiring metrics and KPIs/i)).toBeInTheDocument()

    expect(screen.getByText(/Seamless Integration/i)).toBeInTheDocument()
    expect(screen.getByText(/Job board integrations/i)).toBeInTheDocument()
  })

  it('renders testimonials with name, role and content', () => {
    renderComponent()
    expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument()
    expect(screen.getByText(/IMS transformed our hiring process completely/i)).toBeInTheDocument()

    expect(screen.getByText(/Michael Chen/i)).toBeInTheDocument()
    expect(screen.getByText(/The analytics and reporting features give us insights/i)).toBeInTheDocument()

    expect(screen.getByText(/Emily Rodriguez/i)).toBeInTheDocument()
    expect(screen.getByText(/As a growing startup, IMS scaled with us perfectly/i)).toBeInTheDocument()
  })

  it('CTA Get Started (bottom) navigates to /candidate-register', () => {
    renderComponent()
    // There is a primary Get Started in hero and another in CTA; ensure CTA click triggers navigation
    const allStarts = screen.getAllByRole('button', { name: /Get Started/i })
    expect(allStarts.length).toBeGreaterThanOrEqual(1)
    // Click the last Get Started (CTA)
    fireEvent.click(allStarts[allStarts.length - 1])
    expect(navigateMock).toHaveBeenCalledWith('/candidate-register')
  })
})
